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
  getWalletHealth() {
    return request("/api/wallet");
  }
};
