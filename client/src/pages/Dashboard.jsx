import { useState } from "react";
import ChatBox from "../components/ChatBox";
import WalletCard from "../components/WalletCard";
import ActionButtons from "../components/ActionButtons";
import ConfirmModal from "../components/ConfirmModal";
import TransactionHistory from "../components/TransactionHistory";
import { useMiniMask } from "../hooks/useMiniMask";
import { saveRecentSend } from "../services/transactionHistory";

export default function Dashboard() {
  const [pendingTx, setPendingTx] = useState(null);
  const [status, setStatus] = useState("Ready.");
  const [sendAmount, setSendAmount] = useState("");
  const [sendAddress, setSendAddress] = useState("");
  const [historyRefreshToken, setHistoryRefreshToken] = useState(0);
  const {
    address,
    balance,
    connect,
    error,
    isAvailable,
    isChecking,
    loadCoins,
    refresh,
    send
  } = useMiniMask();

  async function connectWallet() {
    try {
      const nextAddress = await connect();
      setStatus(nextAddress ? "MiniMask connected." : "MiniMask returned no address.");
    } catch (error) {
      setStatus(error.message);
    }
  }

  async function refreshWallet() {
    try {
      await refresh();
      setStatus("Wallet refreshed.");
    } catch (error) {
      setStatus(error.message);
    }
  }

  function handleIntent(result) {
    if (result.intent === "SEND" && result.confirmationRequired) {
      setPendingTx(result.transaction);
      setStatus(result.reply ?? result.message);
      return;
    }

    setStatus(result.reply ?? result.message);
  }

  async function confirmSend() {
    if (!pendingTx) {
      return;
    }

    try {
      const result = await send(pendingTx.amount, pendingTx.address);
      saveRecentSend({
        amount: pendingTx.amount,
        address: pendingTx.address,
        status: "Submitted in MiniMask",
        timestamp: Date.now(),
        id: result?.response?.txpowid || result?.txpowid || `send-${Date.now()}`
      });
      setStatus(`MiniMask response: ${JSON.stringify(result)}`);
      setPendingTx(null);
      setSendAmount("");
      setSendAddress("");
      setHistoryRefreshToken((current) => current + 1);
    } catch (error) {
      setStatus(error.message);
    }
  }

  function handleInstallMiniMask() {
    window.open("https://minima.global/download", "_blank", "noopener,noreferrer");
  }

  function handleSendForm(event) {
    event.preventDefault();
    if (!sendAmount || !sendAddress) {
      setStatus("Enter both amount and wallet address.");
      return;
    }

    setPendingTx({
      amount: Number(sendAmount),
      address: sendAddress
    });
    setStatus(`Please confirm sending ${sendAmount} Minima to ${sendAddress}.`);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
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
        />
        <ChatBox onIntent={handleIntent} />
        <TransactionHistory
          address={address}
          isAvailable={isAvailable}
          isChecking={isChecking}
          loadCoins={loadCoins}
          refreshToken={historyRefreshToken}
        />
      </div>
      <div className="space-y-6">
        <section className="rounded-[30px] border border-black/5 bg-white/70 p-6 shadow-card backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.3em] text-ma-gold">Quick Actions</p>
          <div className="mt-5">
            <ActionButtons
              onBalance={refreshWallet}
              onAddress={connectWallet}
            />
          </div>
        </section>

        <section className="rounded-[30px] border border-black/5 bg-white/70 p-6 shadow-card backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.3em] text-ma-gold">Send Minima</p>
          <form onSubmit={handleSendForm} className="mt-5 space-y-4">
            <input
              type="number"
              min="0"
              step="0.01"
              value={sendAmount}
              onChange={(event) => setSendAmount(event.target.value)}
              className="w-full rounded-[20px] border border-black/10 bg-white px-4 py-3 text-ma-black outline-none transition focus:border-ma-gold"
              placeholder="Amount"
            />
            <input
              value={sendAddress}
              onChange={(event) => setSendAddress(event.target.value)}
              className="w-full rounded-[20px] border border-black/10 bg-white px-4 py-3 text-ma-black outline-none transition focus:border-ma-gold"
              placeholder="Recipient address"
            />
            <button
              type="submit"
              className="w-full rounded-full border border-black bg-black px-5 py-3 font-medium text-ma-gold shadow-[0_12px_28px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5"
            >
              Review Transaction
            </button>
          </form>
        </section>

        <section className="rounded-[30px] border border-black/5 bg-white/70 p-6 shadow-card backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.3em] text-ma-gold">System Status</p>
          <p className="mt-4 text-sm leading-7 text-ma-black/80">
            {error && !isAvailable ? error : status}
          </p>
        </section>
      </div>

      <ConfirmModal
        open={Boolean(pendingTx)}
        message={
          pendingTx
            ? `Confirm sending ${pendingTx.amount} Minima to ${pendingTx.address}`
            : ""
        }
        onConfirm={confirmSend}
        onCancel={() => setPendingTx(null)}
      />
    </div>
  );
}
