import { useMemo, useState } from "react";
import ChatBox from "../components/ChatBox";
import StatusPanel from "../components/StatusPanel";
import SwapCard from "../components/SwapCard";
import TransactionHistory from "../components/TransactionHistory";
import WalletCard from "../components/WalletCard";
import { useMiniMask } from "../hooks/useMiniMask";
import { useSwapDex } from "../hooks/useSwapDex";
import {
  getOwnedTokenBalances,
  sortBalancesByOwnership
} from "../services/walletPortfolio";

export default function Dashboard() {
  const [widgetMode, setWidgetMode] = useState("swap");
  const {
    address,
    balance,
    connect,
    error,
    isAvailable,
    isChecking,
    isSyncing,
    refresh,
    send,
    sendableBalances,
    tokenBalances
  } = useMiniMask();
  const dex = useSwapDex({
    address,
    refreshWallet: refresh,
    send,
    sendableBalances
  });

  const displayedTokenBalances = useMemo(
    () => sortBalancesByOwnership(sendableBalances.length ? sendableBalances : tokenBalances),
    [sendableBalances, tokenBalances]
  );
  const ownedTokenBalances = useMemo(
    () => getOwnedTokenBalances(sendableBalances),
    [sendableBalances]
  );
  const hasSpendableFunds = ownedTokenBalances.length > 0;

  async function connectWallet() {
    try {
      await connect();
    } catch {
      // Wallet hook already surfaces the error in UI state.
    }
  }

  async function refreshWallets() {
    try {
      await dex.refreshAll();
    } catch {
      // Wallet hook already surfaces the error in UI state.
    }
  }

  function handleIntent(result) {
    if (result.swapQuote) {
      setWidgetMode("swap");
      dex.applyAiQuote(result.swapQuote);
    }

    if (result.sendDraft) {
      setWidgetMode("send");
      dex.applyAiSend(result.sendDraft);
    }
  }

  function handleInstallMiniMask() {
    window.open("https://minimask.org/index.html", "_blank", "noopener,noreferrer");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_420px]">
      <div className="space-y-6">
        <section className="panel-surface overflow-hidden p-6">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.16),transparent_60%)]" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="section-kicker">Minima AI Production Dashboard</p>
              <h2 className="mt-3 font-display text-4xl font-semibold text-slate-900 dark:text-white sm:text-5xl">
                Compact wallet actions with real MiniMask sendable intelligence
              </h2>
              <p className="mt-4 text-sm font-semibold leading-7 text-slate-700 dark:text-slate-200">
                The widget prioritizes tokens you actually own, disables unsafe actions when
                sendable balance is zero, and lets MA stage live sends or direct on-chain swap
                requests for MiniMask approval.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[24px] border border-[#ecd79a] bg-[#fff7dd] px-5 py-4 text-slate-900 dark:border-white/10 dark:bg-slate-900 dark:text-white">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-ma-gold">Owned</p>
                <p className="mt-3 text-3xl font-extrabold">{ownedTokenBalances.length}</p>
              </div>
              <div className="rounded-[24px] border border-[#ecd79a] bg-[#fff7dd] px-5 py-4 text-slate-900 dark:border-white/10 dark:bg-slate-900 dark:text-white">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-ma-gold">Mode</p>
                <p className="mt-3 text-xl font-extrabold">MiniMask</p>
              </div>
              <div className="rounded-[24px] border border-[#ecd79a] bg-[#fff7dd] px-5 py-4 text-slate-900 dark:border-white/10 dark:bg-slate-900 dark:text-white">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-ma-gold">Status</p>
                <p className="mt-3 text-xl font-extrabold">
                  {hasSpendableFunds ? "Ready" : "Paused"}
                </p>
              </div>
            </div>
          </div>
        </section>

        <ChatBox
          onIntent={handleIntent}
          walletContext={{
            sendableBalances,
            walletAddress: address
          }}
        />
      </div>

      <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
        <SwapCard
          availableTokens={dex.availableTokens}
          connected={Boolean(address)}
          form={dex.form}
          mode={widgetMode}
          onExecuteSend={dex.executeSend}
          onExecuteSwap={dex.executeSwap}
          onFlip={dex.flipTokens}
          onModeChange={setWidgetMode}
          onSetField={dex.setField}
          onSetSendField={dex.setSendField}
          previewQuote={dex.previewQuote}
          quote={dex.activeQuote}
          quoteLoading={dex.quoteLoading}
          sendDisabledReason={dex.sendDisabledReason}
          sendForm={dex.sendForm}
          sendLoading={dex.sendLoading}
          sendSourceBalance={dex.sendSourceBalance}
          sourceBalance={dex.sourceBalance}
          swapDisabledReason={dex.swapDisabledReason}
          swapLoading={dex.swapLoading}
          tokenBalances={displayedTokenBalances}
          walletAddress={address}
          walletLoading={isChecking || isSyncing}
        />

        <WalletCard
          address={address}
          balance={balance}
          connected={Boolean(address)}
          error={error}
          isAvailable={isAvailable}
          isChecking={isChecking}
          isSyncing={isSyncing}
          onConnect={connectWallet}
          onInstall={handleInstallMiniMask}
          onRefresh={refreshWallets}
          tokenBalances={displayedTokenBalances}
        />

        <StatusPanel
          connected={Boolean(address)}
          hasSpendableFunds={hasSpendableFunds}
          ownedTokenCount={ownedTokenBalances.length}
          status={error && !isAvailable ? error : dex.status}
          transactionFlow={dex.transactionFlow}
        />

        <TransactionHistory
          error={dex.historyError}
          items={dex.history}
          loading={dex.historyLoading}
        />
      </div>
    </div>
  );
}
