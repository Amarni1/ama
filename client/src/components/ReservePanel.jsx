import { motion } from "framer-motion";

function compactAddress(value) {
  const safeValue = String(value || "");

  if (!safeValue) {
    return "Not configured";
  }

  if (safeValue.length <= 18) {
    return safeValue;
  }

  return `${safeValue.slice(0, 10)}...${safeValue.slice(-6)}`;
}

export default function ReservePanel({ config }) {
  const badges = [
    {
      label: "Treasury wallet",
      ok: Boolean(config.treasuryAddress),
      value: compactAddress(config.treasuryAddress)
    },
    {
      label: "Chain verification",
      ok: Boolean(config.chainApiConfigured),
      value: config.chainApiConfigured ? "Enabled" : "MINIMA_CHAIN_API_URL missing"
    },
    {
      label: "Treasury payout",
      ok: Boolean(config.payoutEndpointConfigured),
      value: config.payoutEndpointConfigured ? "Ready" : "TREASURY_PAYOUT_URL missing"
    }
  ];

  return (
    <section className="panel-surface p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="section-kicker">Reserve Model</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-slate-900 dark:text-white">
            Treasury routing
          </h2>
        </div>
        <span
          className={[
            "rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em]",
            config.executionReady
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
              : "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300"
          ].join(" ")}
        >
          {config.executionReady ? "Live Route" : "Needs Config"}
        </span>
      </div>

      <div className="mt-5 grid gap-3">
        {badges.map((item) => (
          <div key={item.label} className="surface-muted p-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">
                {item.label}
              </p>
              <span
                className={[
                  "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em]",
                  item.ok
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                    : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"
                ].join(" ")}
              >
                {item.ok ? "Ready" : "Pending"}
              </span>
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {config.missingConfig?.length ? (
        <div className="mt-5 rounded-[22px] border border-amber-200 bg-[#fff9e8] px-4 py-4 text-sm text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
          {config.missingConfig[0]}
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {config.tokens?.map((token, index) => (
          <motion.div
            key={token.symbol}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="surface-muted p-4"
          >
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-ma-gold">
              {token.symbol}
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
              ${token.price}
            </p>
            <p className="mt-2 break-all text-xs text-slate-500 dark:text-slate-400">
              {token.tokenId || "Token id not configured"}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
