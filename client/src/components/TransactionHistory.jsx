import { useEffect, useState } from "react";
import { formatHistoryTimestamp, mergeHistory } from "../services/transactionHistory";

function HistoryCard({ item }) {
  const isSent = item.direction === "sent";

  return (
    <article className="rounded-[24px] border border-white/70 bg-white/90 p-5 shadow-[0_18px_44px_rgba(212,175,55,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ma-gold">
            {isSent ? "Sent" : "Received"}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-ma-black">
            {item.amount} Minima
          </h3>
        </div>
        <span
          className={
            isSent
              ? "rounded-full bg-black px-3 py-1 text-xs font-medium text-ma-gold"
              : "rounded-full bg-[#fff4cc] px-3 py-1 text-xs font-medium text-ma-black"
          }
        >
          {item.status}
        </span>
      </div>

      <div className="mt-4 space-y-3 text-sm text-ma-black/75">
        <p className="break-all rounded-[18px] bg-[#fffaf0] px-4 py-3">
          {item.address}
        </p>
        <p>{formatHistoryTimestamp(item.timestamp)}</p>
      </div>
    </article>
  );
}

export default function TransactionHistory({
  address,
  isAvailable,
  isChecking,
  loadCoins,
  refreshToken = 0
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadHistory() {
      if (isChecking) {
        return;
      }

      setLoading(true);

      try {
        const rawCoins = isAvailable && loadCoins ? await loadCoins() : [];
        if (!active) {
          return;
        }

        setItems(mergeHistory(rawCoins, address));
        setError("");
      } catch (currentError) {
        if (!active) {
          return;
        }

        setItems(mergeHistory([], address));
        setError(currentError.message || "Unable to load transaction history.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      active = false;
    };
  }, [address, isAvailable, isChecking, loadCoins, refreshToken]);

  const hasItems = items.length > 0;

  return (
    <section className="rounded-[30px] border border-black/5 bg-white/70 p-6 shadow-card backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ma-gold">History</p>
          <h2 className="mt-2 text-2xl font-semibold text-ma-black">Transaction Activity</h2>
        </div>
        {loading ? (
          <span className="rounded-full bg-[#fff4cc] px-3 py-1 text-xs font-medium text-ma-black">
            Loading...
          </span>
        ) : null}
      </div>

      {error ? (
        <div className="mt-5 rounded-[22px] border border-amber-200 bg-[#fff9e8] px-4 py-3 text-sm text-amber-900">
          {error}
        </div>
      ) : null}

      {!loading && !hasItems ? (
        <div className="mt-6 rounded-[24px] border border-dashed border-ma-gold/40 bg-[#fffaf0] p-8 text-center">
          <p className="text-lg font-semibold text-ma-black">No transactions yet</p>
          <p className="mt-2 text-sm text-ma-black/70">
            Successful sends and detected wallet activity will appear here.
          </p>
        </div>
      ) : null}

      {hasItems ? (
        <div className="mt-6 grid gap-4">
          {items.map((item) => (
            <HistoryCard key={item.id} item={item} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
