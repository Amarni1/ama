import { TOKEN_OPTIONS, normalizeTokenSymbol } from "./swapEngine";

export function toNumericAmount(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

export function formatDisplayedAmount(value) {
  const numeric = toNumericAmount(value);

  if (!Number.isFinite(numeric)) {
    return "0";
  }

  return numeric.toFixed(4).replace(/\.?0+$/, "") || "0";
}

export function hasSendableBalance(record) {
  return toNumericAmount(record?.sendable ?? record?.amount) > 0;
}

export function sortBalancesByOwnership(balances = []) {
  return [...balances].sort((left, right) => {
    const leftOwned = hasSendableBalance(left) ? 1 : 0;
    const rightOwned = hasSendableBalance(right) ? 1 : 0;

    if (leftOwned !== rightOwned) {
      return rightOwned - leftOwned;
    }

    const leftSendable = toNumericAmount(left?.sendable ?? left?.amount);
    const rightSendable = toNumericAmount(right?.sendable ?? right?.amount);

    if (leftSendable !== rightSendable) {
      return rightSendable - leftSendable;
    }

    return String(left?.symbol || left?.token || "").localeCompare(
      String(right?.symbol || right?.token || "")
    );
  });
}

export function getOwnedTokenBalances(balances = []) {
  return sortBalancesByOwnership(balances).filter(hasSendableBalance);
}

export function prioritizeOwnedTokens(tokens = TOKEN_OPTIONS, balances = []) {
  const ownedTokens = new Set(
    getOwnedTokenBalances(balances)
      .map((item) => normalizeTokenSymbol(item?.symbol || item?.token))
      .filter(Boolean)
  );

  return [...tokens].sort((left, right) => {
    const leftOwned = ownedTokens.has(left) ? 1 : 0;
    const rightOwned = ownedTokens.has(right) ? 1 : 0;

    if (leftOwned !== rightOwned) {
      return rightOwned - leftOwned;
    }

    return tokens.indexOf(left) - tokens.indexOf(right);
  });
}

export function getTokenBalanceRecord(balances = [], token) {
  const normalizedToken = normalizeTokenSymbol(token) || String(token || "").trim().toUpperCase();

  return (
    balances.find(
      (item) => normalizeTokenSymbol(item?.symbol || item?.token) === normalizedToken
    ) || null
  );
}

export function getTokenSendableBalance(balances = [], token) {
  return toNumericAmount(getTokenBalanceRecord(balances, token)?.sendable);
}

export function getPortfolioSummary(balances = []) {
  const owned = getOwnedTokenBalances(balances);

  if (!owned.length) {
    return "No sendable tokens available yet.";
  }

  return owned
    .map((item) => `${formatDisplayedAmount(item.sendable)} ${item.symbol || item.token}`)
    .join(", ");
}
