import { motion } from "framer-motion";

export default function WalletCard({
  address,
  balance,
  connected,
  error,
  isAvailable,
  isChecking,
  onConnect,
  onInstall,
  onRefresh
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[30px] border border-black/5 bg-white/70 p-6 shadow-card backdrop-blur-xl"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ma-gold">Wallet</p>
          <h2 className="mt-2 text-2xl font-semibold text-ma-black">MiniMask Connector</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onConnect}
            disabled={!isAvailable}
            className="rounded-full border border-black bg-black px-4 py-2 text-sm text-ma-gold shadow-[0_10px_24px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5"
          >
            {isChecking ? "Detecting MiniMask..." : connected ? "Reconnect" : "Connect Wallet"}
          </button>
          <button
            onClick={onRefresh}
            disabled={!isAvailable}
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-ma-black transition hover:border-ma-gold hover:text-ma-gold"
          >
            Refresh
          </button>
          {!isAvailable ? (
            <button
              onClick={onInstall}
              className="rounded-full border border-ma-gold bg-[#fff7dd] px-4 py-2 text-sm text-ma-black transition hover:border-black"
            >
              Install MiniMask
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <span
          className={
            isAvailable
              ? "rounded-full bg-emerald-100 px-3 py-1 text-emerald-700"
              : "rounded-full bg-amber-100 px-3 py-1 text-amber-800"
          }
        >
          {isAvailable ? "MiniMask detected" : isChecking ? "Waiting for extension" : "MiniMask unavailable"}
        </span>
        {error ? <span className="text-red-700">{error}</span> : null}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-[24px] border border-white/60 bg-white/75 p-4 shadow-[0_12px_30px_rgba(0,0,0,0.07)]">
          <p className="text-xs uppercase tracking-[0.25em] text-black/45">Address</p>
          <p className="mt-3 break-all text-sm text-ma-black">
            {address || "No wallet connected yet"}
          </p>
        </div>
        <div className="rounded-[24px] border border-white/60 bg-white/75 p-4 shadow-[0_12px_30px_rgba(0,0,0,0.07)]">
          <p className="text-xs uppercase tracking-[0.25em] text-black/45">Balance</p>
          <p className="mt-3 text-3xl font-semibold text-ma-gold">{balance || "--"} M</p>
        </div>
      </div>
    </motion.section>
  );
}
