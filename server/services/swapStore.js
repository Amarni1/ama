import { randomUUID } from "crypto";

const swapRequests = new Map();

function cloneRecord(record) {
  return JSON.parse(JSON.stringify(record));
}

function createTimelineEvent(status, detail) {
  return {
    detail,
    status,
    time: Date.now()
  };
}

export function createSwapRecord({ quote, treasuryAddress, walletAddress }) {
  const now = Date.now();
  const record = {
    createdAt: now,
    depositTxpowid: "",
    error: "",
    events: [createTimelineEvent("awaiting_deposit", "Awaiting user deposit to treasury wallet.")],
    id: randomUUID(),
    payoutTxpowid: "",
    quote,
    status: "awaiting_deposit",
    statusDetail: "Awaiting user deposit to treasury wallet.",
    treasuryAddress,
    updatedAt: now,
    walletAddress
  };

  swapRequests.set(record.id, record);
  return cloneRecord(record);
}

export function getSwapRecord(recordId) {
  const record = swapRequests.get(recordId);
  return record ? cloneRecord(record) : null;
}

export function updateSwapRecord(recordId, patch) {
  const current = swapRequests.get(recordId);

  if (!current) {
    return null;
  }

  const nextRecord = {
    ...current,
    ...patch,
    updatedAt: Date.now()
  };

  swapRequests.set(recordId, nextRecord);
  return cloneRecord(nextRecord);
}

export function setSwapStatus(recordId, status, detail, patch = {}) {
  const current = swapRequests.get(recordId);

  if (!current) {
    return null;
  }

  const nextRecord = {
    ...current,
    ...patch,
    status,
    statusDetail: detail,
    updatedAt: Date.now(),
    events: [...current.events, createTimelineEvent(status, detail)]
  };

  swapRequests.set(recordId, nextRecord);
  return cloneRecord(nextRecord);
}

export function listSwapRecords(walletAddress = "") {
  const normalizedWallet = String(walletAddress || "").trim().toLowerCase();

  return Array.from(swapRequests.values())
    .filter((record) =>
      !normalizedWallet ||
      String(record.walletAddress || "").trim().toLowerCase() === normalizedWallet
    )
    .sort((left, right) => right.updatedAt - left.updatedAt)
    .map(cloneRecord);
}
