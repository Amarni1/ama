import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "../services/api";
import { convertSwapAmount, TOKEN_OPTIONS } from "../services/swapEngine";
import {
  TX_POLL_INTERVAL_MS,
  buildSwapFlow,
  extractTxPowId
} from "../services/transactionStatus";

function buildFallbackQuote(form, previewQuote) {
  return (
    previewQuote || {
      amount: Number(form.amount || 0),
      fromToken: form.fromToken,
      receiveAmount: "0",
      toToken: form.toToken
    }
  );
}

function mapRequestToFlow(request) {
  if (!request?.quote) {
    return null;
  }

  if (request.status === "submitted") {
    return buildSwapFlow("submitted", request.quote, request.depositTxpowid);
  }

  if (request.status === "processing") {
    return buildSwapFlow(
      "processing",
      request.quote,
      request.payoutTxpowid || request.depositTxpowid
    );
  }

  if (request.status === "success") {
    return buildSwapFlow("success", request.quote, request.payoutTxpowid);
  }

  if (request.status === "timeout") {
    return buildSwapFlow(
      "timeout",
      request.quote,
      request.payoutTxpowid || request.depositTxpowid
    );
  }

  if (request.status === "failed") {
    return buildSwapFlow(
      "failed",
      request.quote,
      request.payoutTxpowid || request.depositTxpowid
    );
  }

  return null;
}

function isTerminalStatus(status) {
  return status === "success" || status === "failed" || status === "timeout";
}

export function useSwapDex({ address, refreshWallet, send }) {
  const [config, setConfig] = useState({
    chainApiConfigured: false,
    executionReady: false,
    missingConfig: [],
    payoutEndpointConfigured: false,
    tokens: [],
    treasuryAddress: ""
  });
  const [configLoading, setConfigLoading] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [swapLoading, setSwapLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [status, setStatus] = useState(
    "Connect MiniMask to route deposits into the treasury-backed swap engine."
  );
  const [quote, setQuote] = useState(null);
  const [history, setHistory] = useState([]);
  const [transactionFlow, setTransactionFlow] = useState(null);
  const [form, setForm] = useState({
    amount: "10",
    fromToken: "MINIMA",
    toToken: "USDT"
  });

  const pollTimerRef = useRef(null);
  const availableTokens = useMemo(
    () => (config.tokens.length ? config.tokens.map((item) => item.symbol) : TOKEN_OPTIONS),
    [config.tokens]
  );
  const previewQuote = useMemo(
    () => convertSwapAmount(form.amount, form.fromToken, form.toToken),
    [form.amount, form.fromToken, form.toToken]
  );

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      window.clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const loadConfig = useCallback(async () => {
    setConfigLoading(true);

    try {
      const nextConfig = await api.getSwapConfig();
      setConfig(nextConfig);
      return nextConfig;
    } catch (error) {
      setStatus(error.message || "Unable to load swap configuration.");
      throw error;
    } finally {
      setConfigLoading(false);
    }
  }, []);

  const loadHistory = useCallback(async (walletAddress = address) => {
    if (!walletAddress) {
      setHistory([]);
      setHistoryError("");
      return [];
    }

    setHistoryLoading(true);

    try {
      const result = await api.getSwapHistory(walletAddress);
      setHistory(result.history || []);
      setHistoryError("");
      return result.history || [];
    } catch (error) {
      setHistoryError(error.message || "Unable to load swap history.");
      throw error;
    } finally {
      setHistoryLoading(false);
    }
  }, [address]);

  const requestQuote = useCallback(async (override = {}) => {
    const nextPayload = {
      amount: override.amount ?? form.amount,
      fromToken: override.fromToken ?? form.fromToken,
      toToken: override.toToken ?? form.toToken
    };

    setQuoteLoading(true);

    try {
      const result = await api.getSwapQuote(nextPayload);
      setQuote(result.quote);
      setStatus(result.message || "Quote ready.");
      return result.quote;
    } catch (error) {
      setStatus(error.message || "Unable to load swap quote.");
      throw error;
    } finally {
      setQuoteLoading(false);
    }
  }, [form.amount, form.fromToken, form.toToken]);

  const beginPolling = useCallback((requestId) => {
    stopPolling();

    pollTimerRef.current = window.setInterval(async () => {
      try {
        const result = await api.getSwapRequest(requestId);
        const nextRequest = result.request;

        setTransactionFlow(mapRequestToFlow(nextRequest));
        setStatus(
          nextRequest.statusDetail ||
            "Checking the latest treasury swap state."
        );

        if (isTerminalStatus(nextRequest.status)) {
          stopPolling();
          await Promise.allSettled([
            loadHistory(),
            refreshWallet ? refreshWallet() : Promise.resolve()
          ]);
        }
      } catch (error) {
        setStatus(error.message || "Unable to refresh swap status.");
      }
    }, TX_POLL_INTERVAL_MS);
  }, [loadHistory, refreshWallet, stopPolling]);

  const executeSwap = useCallback(async () => {
    const fallbackQuote = buildFallbackQuote(form, previewQuote);
    setSwapLoading(true);

    try {
      if (!address) {
        throw new Error("Connect MiniMask before submitting a swap.");
      }

      const canonicalQuote = await requestQuote();
      if (!canonicalQuote?.executionReady) {
        throw new Error(
          canonicalQuote?.missingConfig?.[0] ||
            "The treasury route is not fully configured for this pair."
        );
      }

      setTransactionFlow(buildSwapFlow("submitting", canonicalQuote));
      setStatus("Opening MiniMask for the treasury deposit.");

      const created = await api.createSwapRequest({
        amount: canonicalQuote.amount,
        fromToken: canonicalQuote.fromToken,
        toToken: canonicalQuote.toToken,
        walletAddress: address
      });

      const request = created.request;
      const sendResult = await send(canonicalQuote.amount, request.treasuryAddress, {
        state: {
          0: "swap",
          1: request.id,
          2: canonicalQuote.fromToken,
          3: canonicalQuote.toToken,
          4: String(canonicalQuote.amount),
          5: String(canonicalQuote.receiveAmount)
        },
        tokenid: canonicalQuote.fromTokenId
      });

      const txpowid = extractTxPowId(sendResult);
      if (!txpowid) {
        throw new Error("MiniMask did not return a transaction id for the treasury deposit.");
      }

      const submitted = await api.submitSwapRequest(request.id, {
        txpowid,
        walletAddress: address
      });

      setTransactionFlow(buildSwapFlow("submitted", canonicalQuote, txpowid));
      setStatus(
        submitted.request?.statusDetail ||
          "Deposit submitted. Waiting for on-chain verification."
      );

      await Promise.allSettled([
        loadHistory(),
        refreshWallet ? refreshWallet() : Promise.resolve()
      ]);
      beginPolling(request.id);

      return submitted.request;
    } catch (error) {
      setTransactionFlow(buildSwapFlow("failed", quote || fallbackQuote));
      setStatus(error.message || "Unable to execute the swap.");
      throw error;
    } finally {
      setSwapLoading(false);
    }
  }, [
    address,
    beginPolling,
    form,
    previewQuote,
    quote,
    refreshWallet,
    requestQuote,
    send,
    loadHistory
  ]);

  const applyAiQuote = useCallback((nextQuote) => {
    if (!nextQuote) {
      return;
    }

    setForm({
      amount: String(nextQuote.amount ?? ""),
      fromToken: nextQuote.fromToken || "MINIMA",
      toToken: nextQuote.toToken || "USDT"
    });
    setQuote(nextQuote);
    setStatus(
      `AI staged ${nextQuote.amount} ${nextQuote.fromToken} -> ${nextQuote.receiveAmount} ${nextQuote.toToken}.`
    );
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.allSettled([
      loadConfig(),
      loadHistory(),
      refreshWallet ? refreshWallet() : Promise.resolve()
    ]);
  }, [loadConfig, loadHistory, refreshWallet]);

  const setField = useCallback((field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }, []);

  const flipTokens = useCallback(() => {
    setForm((current) => ({
      ...current,
      fromToken: current.toToken,
      toToken: current.fromToken
    }));
  }, []);

  useEffect(() => {
    void loadConfig().catch(() => undefined);
  }, [loadConfig]);

  useEffect(() => {
    void loadHistory().catch(() => undefined);
  }, [loadHistory]);

  useEffect(() => {
    if (!quote) {
      return;
    }

    const quoteAmount = Number(quote.amount || 0);
    const formAmount = Number(form.amount || 0);

    if (
      quote.fromToken !== form.fromToken ||
      quote.toToken !== form.toToken ||
      quoteAmount !== formAmount
    ) {
      setQuote(null);
    }
  }, [form, quote]);

  useEffect(() => stopPolling, [stopPolling]);

  return {
    activeQuote: quote,
    applyAiQuote,
    availableTokens,
    config,
    configLoading,
    executeSwap,
    form,
    flipTokens,
    history,
    historyError,
    historyLoading,
    previewQuote,
    quoteLoading,
    refreshAll,
    requestQuote,
    setField,
    status,
    swapLoading,
    transactionFlow
  };
}
