import { useMiniMask } from "../hooks/useMiniMask";
import TransactionHistory from "../components/TransactionHistory";

export default function Transactions() {
  const { address, isAvailable, isChecking, loadCoins } = useMiniMask();

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-black/5 bg-white/70 p-6 shadow-card backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-ma-gold">Transaction Safety</p>
        <h2 className="mt-3 text-2xl font-semibold text-ma-black">Confirmation-first workflow</h2>
        <div className="mt-6 grid gap-4">
          <div className="rounded-[24px] border border-white/60 bg-white/80 p-4 text-ma-black/80">
            All send requests are reviewed by the backend intent parser first.
          </div>
          <div className="rounded-[24px] border border-white/60 bg-white/80 p-4 text-ma-black/80">
            The backend returns confirmation copy instead of executing transfers.
          </div>
          <div className="rounded-[24px] border border-white/60 bg-white/80 p-4 text-ma-black/80">
            MiniMask is only invoked after a user confirms in the UI.
          </div>
        </div>
      </section>

      <TransactionHistory
        address={address}
        isAvailable={isAvailable}
        isChecking={isChecking}
        loadCoins={loadCoins}
      />
    </div>
  );
}
