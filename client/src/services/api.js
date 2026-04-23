function normalizeApiUrl(url) {
  if (!url) {
    return "";
  }

  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function getDefaultApiUrl() {
  if (typeof window === "undefined") {
    return "";
  }

  const hostname = window.location.hostname;
  const isLocalHost =
    hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";

  return isLocalHost ? "http://localhost:4000" : "";
}

const API_URL = normalizeApiUrl(import.meta.env.VITE_API_URL) || getDefaultApiUrl();

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    },
    ...options
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message ?? "Request failed");
  }

  return response.json();
}

export const api = {
  sendMessage(message) {
    return request("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message })
    });
  },
  getSwapConfig() {
    return request("/api/swaps/config");
  },
  getSwapQuote(payload) {
    return request("/api/swaps/quote", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  createSwapRequest(payload) {
    return request("/api/swaps/requests", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  submitSwapRequest(recordId, payload) {
    return request(`/api/swaps/requests/${recordId}/submit`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  getSwapRequest(recordId) {
    return request(`/api/swaps/requests/${recordId}`);
  },
  getSwapHistory(walletAddress = "") {
    const query = walletAddress ? `?wallet=${encodeURIComponent(walletAddress)}` : "";
    return request(`/api/swaps/history${query}`);
  },
  getWalletHealth() {
    return request("/api/wallet");
  }
};
