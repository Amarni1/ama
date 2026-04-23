const CONFIRMATION_POLL_INTERVAL_MS = 3000;
const CONFIRMATION_TIMEOUT_MS = 60000;

function getBaseUrl() {
  return String(process.env.MINIMA_CHAIN_API_URL || "").replace(/\/$/, "");
}

function extractPayload(result) {
  if (!result || typeof result !== "object") {
    return result;
  }

  if ("response" in result) {
    return result.response;
  }

  if ("data" in result) {
    return result.data;
  }

  return result;
}

export function extractTxPowId(result) {
  return (
    result?.txpowid ||
    result?.response?.txpowid ||
    result?.response?.id ||
    result?.data?.txpowid ||
    result?.data?.id ||
    result?.id ||
    ""
  );
}

export function isTxConfirmed(result) {
  const payload = extractPayload(result);

  if (typeof payload === "boolean") {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    return false;
  }

  const booleanSignals = [
    payload.confirmed,
    payload.onchain,
    payload.onChain,
    payload.found,
    payload.success
  ];

  if (booleanSignals.some((signal) => signal === true)) {
    return true;
  }

  const numericSignals = [
    payload.depth,
    payload.confirmations,
    payload.block,
    payload.blockheight
  ];

  if (numericSignals.some((signal) => Number(signal) > 0)) {
    return true;
  }

  const textSignals = [
    payload.status,
    payload.message,
    payload.info,
    payload.result
  ]
    .map((item) => String(item || "").trim().toLowerCase())
    .filter(Boolean);

  return textSignals.some((item) =>
    item.includes("confirmed") ||
    item.includes("on chain") ||
    item.includes("onchain") ||
    item.includes("found")
  );
}

async function parseJsonResponse(response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Expected JSON from chain gateway but received: ${text.slice(0, 180)}`);
  }
}

async function tryRequest(url, init) {
  const response = await fetch(url, init);
  const payload = await parseJsonResponse(response);

  if (!response.ok) {
    throw new Error(payload.message || `Chain gateway request failed with ${response.status}.`);
  }

  return payload;
}

async function callGateway(endpoint, payload) {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    throw new Error("MINIMA_CHAIN_API_URL is not configured.");
  }

  const candidates = [
    `${baseUrl}/${endpoint}`,
    `${baseUrl}/api/${endpoint}`,
    `${baseUrl}/meg/${endpoint}`
  ];

  const errors = [];

  for (const candidate of candidates) {
    try {
      return await tryRequest(candidate, {
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json"
        },
        method: "POST"
      });
    } catch (postError) {
      errors.push(postError.message);
    }

    try {
      const query = new URLSearchParams(payload).toString();
      return await tryRequest(`${candidate}?${query}`, {
        headers: {
          Accept: "application/json"
        },
        method: "GET"
      });
    } catch (getError) {
      errors.push(getError.message);
    }
  }

  throw new Error(errors[errors.length - 1] || `Unable to call chain gateway endpoint ${endpoint}.`);
}

export async function checkTxPow(txpowid) {
  return callGateway("checktxpow", { txpowid });
}

export async function getTxPow(txpowid) {
  return callGateway("gettxpow", { txpowid });
}

function extractTransactionEnvelope(result) {
  const payload = extractPayload(result);

  return (
    payload?.txpow ||
    payload?.txpowdata ||
    payload?.data?.txpow ||
    payload?.data ||
    payload ||
    {}
  );
}

function extractTxInputs(result) {
  const envelope = extractTransactionEnvelope(result);

  return (
    envelope?.body?.txn?.inputs ||
    envelope?.txn?.inputs ||
    envelope?.transaction?.inputs ||
    envelope?.inputs ||
    []
  );
}

function extractTxOutputs(result) {
  const envelope = extractTransactionEnvelope(result);

  return (
    envelope?.body?.txn?.outputs ||
    envelope?.txn?.outputs ||
    envelope?.transaction?.outputs ||
    envelope?.outputs ||
    []
  );
}

function sameAddress(left, right) {
  return String(left || "").trim().toLowerCase() === String(right || "").trim().toLowerCase();
}

function readTokenId(record) {
  return String(record?.tokenid || record?.tokenId || "").trim();
}

function readAmount(record, tokenId) {
  const candidates = [
    tokenId === "0x00" ? record?.amount : record?.tokenamount,
    record?.amount,
    record?.tokenamount,
    record?.value
  ];

  for (const candidate of candidates) {
    if (candidate !== undefined && candidate !== null && candidate !== "") {
      const numeric = Number(candidate);
      if (Number.isFinite(numeric)) {
        return numeric;
      }
    }
  }

  return 0;
}

export function verifyDepositOnChain(txpowResult, swapRequest) {
  const outputs = extractTxOutputs(txpowResult);
  const inputs = extractTxInputs(txpowResult);

  const matchingOutput = outputs.find((output) =>
    sameAddress(output.address || output.miniaddress, swapRequest.treasuryAddress) &&
    readTokenId(output) === swapRequest.quote.fromTokenId &&
    readAmount(output, swapRequest.quote.fromTokenId) >= Number(swapRequest.quote.amount)
  );

  if (!matchingOutput) {
    throw new Error("Confirmed transaction did not send the expected token amount to the treasury wallet.");
  }

  const walletParticipated = inputs.some((input) =>
    sameAddress(input.address || input.miniaddress, swapRequest.walletAddress)
  );

  if (!walletParticipated) {
    throw new Error("Confirmed transaction was found on-chain but does not include the expected wallet address.");
  }

  return {
    treasuryAmount: readAmount(matchingOutput, swapRequest.quote.fromTokenId),
    treasuryTokenId: readTokenId(matchingOutput)
  };
}

export async function waitForConfirmation(txpowid) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < CONFIRMATION_TIMEOUT_MS) {
    const status = await checkTxPow(txpowid);
    if (isTxConfirmed(status)) {
      return status;
    }

    await new Promise((resolve) => setTimeout(resolve, CONFIRMATION_POLL_INTERVAL_MS));
  }

  throw new Error("Timed out waiting for on-chain confirmation.");
}
