import {
  extractTxPowId,
  getTxPow,
  verifyDepositOnChain,
  waitForConfirmation
} from "./chainGateway.js";
import {
  buildSwapQuote,
  getSwapRuntimeConfig
} from "./swapEngine.js";
import {
  createSwapRecord,
  getSwapRecord,
  listSwapRecords,
  setSwapStatus
} from "./swapStore.js";

const activeJobs = new Set();

function requireSwapRecord(recordId) {
  const record = getSwapRecord(recordId);
  if (!record) {
    throw new Error("Swap request not found.");
  }

  return record;
}

function assertTreasuryReady(quote) {
  const runtime = getSwapRuntimeConfig();
  const missingConfig = [
    ...runtime.missingConfig,
    ...(quote.missingConfig || [])
  ].filter(Boolean);

  if (missingConfig.length) {
    throw new Error(missingConfig[0]);
  }

  return runtime;
}

async function requestTreasuryPayout(record, verification) {
  const payoutUrl = String(process.env.TREASURY_PAYOUT_URL || "").trim();

  if (!payoutUrl) {
    throw new Error("TREASURY_PAYOUT_URL is not configured.");
  }

  const response = await fetch(payoutUrl, {
    body: JSON.stringify({
      amount: String(record.quote.receiveAmount),
      depositTxpowid: record.depositTxpowid,
      quote: record.quote,
      requestId: record.id,
      toAddress: record.walletAddress,
      token: record.quote.toToken,
      tokenId: record.quote.toTokenId,
      treasuryAddress: record.treasuryAddress,
      verification
    }),
    headers: {
      "Content-Type": "application/json",
      ...(process.env.TREASURY_PAYOUT_TOKEN
        ? { Authorization: `Bearer ${process.env.TREASURY_PAYOUT_TOKEN}` }
        : {})
    },
    method: "POST"
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || "Treasury payout service rejected the swap payout.");
  }

  const payoutTxpowid = extractTxPowId(payload);
  if (!payoutTxpowid) {
    throw new Error("Treasury payout service did not return a payout txpowid.");
  }

  return {
    payload,
    payoutTxpowid
  };
}

async function processSwapRecord(recordId) {
  if (activeJobs.has(recordId)) {
    return;
  }

  activeJobs.add(recordId);

  try {
    const submittedRecord = requireSwapRecord(recordId);
    setSwapStatus(recordId, "processing", "Verifying the user deposit on-chain.");
    await waitForConfirmation(submittedRecord.depositTxpowid);

    const txpow = await getTxPow(submittedRecord.depositTxpowid);
    const verification = verifyDepositOnChain(txpow, submittedRecord);

    setSwapStatus(recordId, "processing", "Deposit confirmed. Requesting treasury payout.");
    const payout = await requestTreasuryPayout(submittedRecord, verification);

    setSwapStatus(recordId, "processing", "Treasury payout submitted to the network.", {
      payoutTxpowid: payout.payoutTxpowid
    });

    await waitForConfirmation(payout.payoutTxpowid);
    setSwapStatus(recordId, "success", "Treasury payout confirmed on-chain.", {
      payoutTxpowid: payout.payoutTxpowid
    });
  } catch (error) {
    const status = String(error.message || "").toLowerCase().includes("timed out")
      ? "timeout"
      : "failed";

    setSwapStatus(recordId, status, error.message || "Swap processing failed.", {
      error: error.message || "Swap processing failed."
    });
  } finally {
    activeJobs.delete(recordId);
  }
}

export function getSwapConfig() {
  return getSwapRuntimeConfig();
}

export function createSwapRequest({ amount, fromToken, toToken, walletAddress }) {
  const quote = buildSwapQuote(amount, fromToken, toToken);

  if (!quote) {
    throw new Error("Unable to build a valid swap quote for that pair.");
  }

  const runtime = assertTreasuryReady(quote);
  return createSwapRecord({
    quote,
    treasuryAddress: runtime.treasuryAddress,
    walletAddress
  });
}

export function getSwapRequest(recordId) {
  return requireSwapRecord(recordId);
}

export function listSwapHistory(walletAddress) {
  return listSwapRecords(walletAddress);
}

export function submitSwapDeposit({ recordId, txpowid, walletAddress }) {
  const record = requireSwapRecord(recordId);

  if (
    walletAddress &&
    String(walletAddress).trim().toLowerCase() !== String(record.walletAddress).trim().toLowerCase()
  ) {
    throw new Error("Wallet address does not match this swap request.");
  }

  if (record.status === "success") {
    return record;
  }

  const updated = setSwapStatus(recordId, "submitted", "Deposit submitted to treasury route.", {
    depositTxpowid: txpowid
  });

  void processSwapRecord(recordId);
  return updated;
}
