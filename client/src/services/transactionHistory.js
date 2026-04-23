export function formatHistoryTimestamp(timestamp) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(timestamp));
}

export function compactHash(value) {
  const safeValue = String(value || "");

  if (!safeValue) {
    return "Unavailable";
  }

  if (safeValue.length <= 18) {
    return safeValue;
  }

  return `${safeValue.slice(0, 10)}...${safeValue.slice(-6)}`;
}

export function formatSwapHistorySummary(item) {
  if (!item?.quote) {
    return "Swap request";
  }

  return `${item.quote.amount} ${item.quote.fromToken} -> ${item.quote.receiveAmount} ${item.quote.toToken}`;
}
