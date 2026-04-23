export const TOKEN_PRICES = {
  MINIMA: 0.5,
  USDT: 1,
  USDC: 1,
  MA: 3,
  LUCOS: 0.1,
  GRETES: 0.2
};

const TOKEN_DECIMALS = {
  MINIMA: 8,
  USDT: 8,
  USDC: 8,
  MA: 8,
  LUCOS: 8,
  GRETES: 8
};

const DEFAULT_TOKEN_IDS = {
  MINIMA: "0x00",
  USDT: "0x7E6E60E033C7F74400B02F270074D0DA99FB863C33F8EA75078219258DCFC6CE",
  USDC: "",
  MA: "",
  LUCOS: "",
  GRETES: ""
};

const TOKEN_ENV_KEYS = {
  MINIMA: "",
  USDT: "SWAP_TOKEN_ID_USDT",
  USDC: "SWAP_TOKEN_ID_USDC",
  MA: "SWAP_TOKEN_ID_MA",
  LUCOS: "SWAP_TOKEN_ID_LUCOS",
  GRETES: "SWAP_TOKEN_ID_GRETES"
};

const TOKEN_LABELS = {
  MINIMA: "Minima",
  USDT: "Tether USD",
  USDC: "USD Coin",
  MA: "Minima AI",
  LUCOS: "LUCOS",
  GRETES: "GRETES"
};

export const TOKEN_OPTIONS = Object.keys(TOKEN_PRICES);

function sanitizeTokenId(value) {
  return String(value || "").trim();
}

export function normalizeTokenSymbol(token) {
  const normalized = String(token || "").trim().toUpperCase();
  return TOKEN_OPTIONS.includes(normalized) ? normalized : null;
}

export function getTreasuryAddress() {
  return String(process.env.TREASURY_ADDRESS || "").trim();
}

function readTokenId(symbol) {
  const envKey = TOKEN_ENV_KEYS[symbol];
  return sanitizeTokenId(
    (envKey ? process.env[envKey] : "") || DEFAULT_TOKEN_IDS[symbol] || ""
  );
}

export function getTokenDefinitions() {
  return TOKEN_OPTIONS.map((symbol) => ({
    symbol,
    label: TOKEN_LABELS[symbol],
    price: TOKEN_PRICES[symbol],
    decimals: TOKEN_DECIMALS[symbol],
    tokenId: readTokenId(symbol),
    configured: Boolean(readTokenId(symbol))
  }));
}

export function getTokenDefinition(token) {
  const symbol = normalizeTokenSymbol(token);
  if (!symbol) {
    return null;
  }

  return getTokenDefinitions().find((item) => item.symbol === symbol) || null;
}

export function getSwapRuntimeConfig() {
  const treasuryAddress = getTreasuryAddress();
  const tokens = getTokenDefinitions();
  const missingTokenIds = tokens
    .filter((token) => token.symbol !== "MINIMA" && !token.tokenId)
    .map((token) => `Missing token id for ${token.symbol}`);

  const missingConfig = [
    ...missingTokenIds,
    !treasuryAddress ? "TREASURY_ADDRESS is not configured." : "",
    !process.env.MINIMA_CHAIN_API_URL ? "MINIMA_CHAIN_API_URL is not configured." : "",
    !process.env.TREASURY_PAYOUT_URL ? "TREASURY_PAYOUT_URL is not configured." : ""
  ].filter(Boolean);

  return {
    chainApiConfigured: Boolean(process.env.MINIMA_CHAIN_API_URL),
    executionReady: missingConfig.length === 0,
    missingConfig,
    payoutEndpointConfigured: Boolean(process.env.TREASURY_PAYOUT_URL),
    tokens,
    treasuryAddress
  };
}

export function buildSwapQuote(amount, fromToken, toToken) {
  const source = getTokenDefinition(fromToken);
  const target = getTokenDefinition(toToken);
  const numericAmount = Number(amount);

  if (!source || !target || !Number.isFinite(numericAmount) || numericAmount <= 0) {
    return null;
  }

  if (source.symbol === target.symbol) {
    return null;
  }

  const usdValue = numericAmount * TOKEN_PRICES[source.symbol];
  const runtime = getSwapRuntimeConfig();
  const missingConfig = [
    !runtime.chainApiConfigured ? "MINIMA_CHAIN_API_URL is not configured." : "",
    !runtime.payoutEndpointConfigured ? "TREASURY_PAYOUT_URL is not configured." : "",
    !runtime.treasuryAddress ? "TREASURY_ADDRESS is not configured." : "",
    !source.tokenId ? `Missing token id for ${source.symbol}.` : "",
    !target.tokenId ? `Missing token id for ${target.symbol}.` : ""
  ].filter(Boolean);

  return {
    amount: numericAmount,
    executionReady: missingConfig.length === 0,
    fromToken: source.symbol,
    fromTokenId: source.tokenId,
    missingConfig,
    priceFrom: TOKEN_PRICES[source.symbol],
    priceTo: TOKEN_PRICES[target.symbol],
    receiveAmount: (usdValue / TOKEN_PRICES[target.symbol]).toFixed(4),
    toToken: target.symbol,
    toTokenId: target.tokenId,
    treasuryAddress: runtime.treasuryAddress,
    usdValue: usdValue.toFixed(2)
  };
}

export function getPriceTable() {
  return getTokenDefinitions().map((token) => ({
    configured: token.configured,
    price: token.price,
    token: token.symbol,
    tokenId: token.tokenId
  }));
}

export function buildBestSwapSuggestion(fromToken) {
  const source = normalizeTokenSymbol(fromToken);
  if (!source) {
    return null;
  }

  const candidates = TOKEN_OPTIONS.filter((token) => token !== source);
  const bestToken = candidates.reduce((best, current) =>
    TOKEN_PRICES[current] > TOKEN_PRICES[best] ? current : best
  );
  const sampleQuote = buildSwapQuote(10, source, bestToken);

  return {
    bestToken,
    fromToken: source,
    reply:
      bestToken === "MA"
        ? `By pure price, MA is the highest-priced target at $3. 10 ${source} would equal ${sampleQuote?.receiveAmount || "0"} ${bestToken}. If you want stability instead, USDT and USDC stay at $1.`
        : `${bestToken} is currently the highest-priced token against ${source}.`
  };
}
