import { motion } from "framer-motion";
import {
  compactHash,
  formatHistoryLabel,
  formatHistorySummary,
  formatHistoryTimestamp
} from "../services/transactionHistory";
import LoadingDots from "./LoadingDots";

function HistoryCard({ item }) {
  const statusText = String(item.status || "").toLowerCase();
  const txReference = item.txpowid || item.depositTxpowid || item.payoutTxpowid || "";
  const isSend = item.type === "send";
  const statusClass = statusText.includes("confirm") || statusText.includes("success")
    ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
    : statusText.includes("submitting")
      ? "rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700 dark:bg-sky-500/15 dark:text-sky-300"
      : statusText.includes("processing")
        ? "rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-500/15 dark:text-amber-300"
        : statusText.includes("submitted")
          ? "rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-ma-gold dark:bg-white/10"
          : statusText.includes("failed") || statusText.includes("timeout")
            ? "rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"
            : "rounded-full bg-[#fff4cc] px-3 py-1 text-xs font-bold text-slate-800 dark:bg-ma-gold/15 dark:text-ma-gold";

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="surface-muted p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-ma-gold">
            {formatHistoryLabel(item)}
          </p>
          <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
            {formatHistorySummary(item)}
          </h3>
        </div>
        <span className={statusClass}>{item.status}</span>
      </div>

      <div className="mt-4 space-y-3 text-sm font-medium text-slate-600 dark:text-slate-300">
        <p className="rounded-[18px] bg-[#fffaf0] px-4 py-3 dark:bg-white/5">
          Wallet: {compactHash(item.walletAddress)}
        </p>
        <p className="rounded-[18px] bg-[#fffaf0] px-4 py-3 dark:bg-white/5">
          Recipient: {compactHash(item.recipientAddress || item.walletAddress)}
        </p>
        <p className="rounded-[18px] bg-[#fffaf0] px-4 py-3 dark:bg-white/5">
          {isSend
            ? `Asset: ${item.token || "MINIMA"}`
            : `Route: ${item.metadataOnly ? "Metadata-only request" : "Token-aware request"}`}
        </p>
        {txReference ? (
          <p className="rounded-[18px] bg-[#fffaf0] px-4 py-3 dark:bg-white/5">
            TxPow: {compactHash(txReference)}
          </p>
        ) : null}
        {item.statusDetail ? <p>{item.statusDetail}</p> : null}
        <p>{formatHistoryTimestamp(item.updatedAt || item.createdAt || Date.now())}</p>
      </div>
    </motion.article>
  );
}

export default function TransactionHistory({ items = [], loading = false, error = "" }) {
  const hasItems = items.length > 0;

  return (
    <section className="panel-surface p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="section-kicker">History</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-slate-900 dark:text-white">
            Wallet activity
          </h2>
          <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-300">
            Signed swap requests and wallet sends with txpow tracking and confirmation timestamps.
          </p>
        </div>
        {loading ? <LoadingDots label="Loading activity" /> : null}
      </div>

      {error ? (
        <div className="mt-5 rounded-[22px] border border-amber-200 bg-[#fff9e8] px-4 py-3 text-sm font-semibold text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-6 grid gap-4">
          {[0, 1, 2].map((item) => (
            <div key={item} className="surface-muted animate-pulse-soft p-5">
              <div className="h-3 w-24 rounded-full bg-ma-gold/30" />
              <div className="mt-4 h-8 w-40 rounded-full bg-slate-200 dark:bg-white/10" />
              <div className="mt-4 h-12 rounded-[18px] bg-slate-200 dark:bg-white/10" />
              <div className="mt-4 h-4 w-28 rounded-full bg-slate-200 dark:bg-white/10" />
            </div>
          ))}
        </div>
      ) : null}

      {!loading && !hasItems ? (
        <div className="mt-6 rounded-[24px] border border-dashed border-ma-gold/40 bg-[#fffaf0] p-8 text-center dark:bg-white/5">
          <p className="text-lg font-bold text-slate-900 dark:text-white">No activity yet</p>
          <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-300">
            Signed swaps and wallet sends will appear here after MiniMask submits them.
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
