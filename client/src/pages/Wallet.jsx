import { useEffect, useState } from "react";
import ReservePanel from "../components/ReservePanel";
import TransactionHistory from "../components/TransactionHistory";
import WalletCard from "../components/WalletCard";
import { useMiniMask } from "../hooks/useMiniMask";
import { useSwapDex } from "../hooks/useSwapDex";

export default function Wallet() {
  const [status, setStatus] = useState("");
  const {
    address,
    balance,
    connect,
    error,
    isAvailable,
    isChecking,
    refresh,
    send,
    sendableBalances,
    tokenBalances
  } = useMiniMask();
  const dex = useSwapDex({
    address,
    refreshWallet: refresh,
    send
  });

  async function connectWallet() {
    try {
      await connect();
      setStatus("MiniMask connected.");
    } catch (currentError) {
      setStatus(currentError.message);
    }
  }

  async function refreshWallet() {
    try {
      await dex.refreshAll();
      setStatus("Wallet refreshed.");
    } catch (currentError) {
      setStatus(currentError.message);
    }
  }

  useEffect(() => {
    void refreshWallet();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleInstallMiniMask() {
    window.open("https://minimask.org/index.html", "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-6">
      <WalletCard
        address={address}
        balance={balance}
        error={error}
        isAvailable={isAvailable}
        isChecking={isChecking}
        onConnect={connectWallet}
        onInstall={handleInstallMiniMask}
        onRefresh={refreshWallet}
        connected={Boolean(address)}
        tokenBalances={sendableBalances.length ? sendableBalances : tokenBalances}
      />
      <ReservePanel config={dex.config} />
      {status ? (
        <section className="panel-surface p-6 text-sm text-slate-700 dark:text-slate-200">
          {status}
        </section>
      ) : null}
      <TransactionHistory
        error={dex.historyError}
        items={dex.history}
        loading={dex.historyLoading}
      />
    </div>
  );
}
