import { motion } from "framer-motion";
import {
  formatDisplayedAmount,
  getOwnedTokenBalances
} from "../services/walletPortfolio";
import { formatWalletAddress } from "../services/walletData";
import LoadingDots from "./LoadingDots";

function ModeButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "btn-gold !px-4 !py-2"
          : "btn-secondary !px-4 !py-2"
      }
    >
      {children}
    </button>
  );
}

export default function SwapCard({
  availableTokens,
  connected,
  form,
  mode,
  onExecuteSend,
  onExecuteSwap,
  onFlip,
  onModeChange,
  onSetField,
  onSetSendField,
  previewQuote,
  quote,
  quoteLoading,
  sendDisabledReason,
  sendForm,
  sendLoading,
  sendSourceBalance,
  sourceBalance,
  swapDisabledReason,
  swapLoading,
  tokenBalances = [],
  walletAddress,
  walletLoading
}) {
  const activeQuote = quote || previewQuote;
  const ownedTokens = getOwnedTokenBalances(tokenBalances).slice(0, 3);
  const isSwapMode = mode === "swap";

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="panel-surface overflow-hidden p-5"
    >
      <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.22),transparent_72%)]" />
      <div className="relative space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="section-kicker">Compact DEX Widget</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-slate-900 dark:text-white">
              Swap or send with MiniMask
            </h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-700 dark:text-slate-200">
              Real sendable balances, owned-token prioritization, and direct Minima signing.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <ModeButton active={isSwapMode} onClick={() => onModeChange("swap")}>
              Swap
            </ModeButton>
            <ModeButton active={!isSwapMode} onClick={() => onModeChange("send")}>
              Send
            </ModeButton>
          </div>
        </div>

        <div className="rounded-[28px] border border-[#e5c76f] bg-[linear-gradient(180deg,#070707_0%,#111111_100%)] p-4 shadow-[0_30px_60px_rgba(15,23,42,0.28)]">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-white/10 bg-white/5 px-4 py-3">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.32em] text-white/45">
                Wallet route
              </p>
              <p className="mt-2 text-sm font-bold text-white">
                {connected ? formatWalletAddress(walletAddress) : "MiniMask not connected"}
              </p>
            </div>
            {walletLoading ? (
              <LoadingDots label="Syncing" />
            ) : (
              <span className="rounded-full bg-ma-gold/15 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.24em] text-ma-gold">
                Direct On-Chain
              </span>
            )}
          </div>

          {ownedTokens.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {ownedTokens.map((token) => (
                <span
                  key={token.id || token.symbol}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-white"
                >
                  {token.symbol}: {formatDisplayedAmount(token.sendable)}
                </span>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-[22px] border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-100">
              MiniMask is connected, but no sendable balance is available yet. Swap and send stay disabled until funds are spendable.
            </div>
          )}

          {isSwapMode ? (
            <div className="mt-4 space-y-4">
              <div className="rounded-[24px] border border-white/10 bg-black/45 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-white/55">
                    From
                  </p>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-ma-gold">
                    Sendable {formatDisplayedAmount(sourceBalance)} {form.fromToken}
                  </p>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px]">
                  <input
                    type="number"
                    min="0"
                    step="0.0001"
                    value={form.amount}
                    onChange={(event) => onSetField("amount", event.target.value)}
                    className="w-full bg-transparent text-4xl font-black text-white outline-none placeholder:text-white/20"
                    placeholder="0.0"
                  />
                  <select
                    value={form.fromToken}
                    onChange={(event) => onSetField("fromToken", event.target.value)}
                    className="input-premium !rounded-[18px] !border-white/10 !bg-[#151515] !text-white"
                  >
                    {availableTokens.map((token) => (
                      <option key={token} value={token}>
                        {token}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={onFlip}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#e5c76f] bg-[linear-gradient(180deg,#fdf1b8_0%,#e0ba43_45%,#a87910_100%)] text-xl font-black text-slate-950 shadow-[0_18px_30px_rgba(212,175,55,0.3)] transition hover:-translate-y-1"
                >
                  {"><"}
                </button>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-black/45 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-white/55">
                    To
                  </p>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-ma-gold">
                    Live quote
                  </p>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px]">
                  <div className="text-4xl font-black text-white">
                    {activeQuote ? activeQuote.receiveAmount : "0.0000"}
                  </div>
                  <select
                    value={form.toToken}
                    onChange={(event) => onSetField("toToken", event.target.value)}
                    className="input-premium !rounded-[18px] !border-white/10 !bg-[#151515] !text-white"
                  >
                    {availableTokens.map((token) => (
                      <option key={token} value={token}>
                        {token}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80">
                {activeQuote
                  ? `${activeQuote.amount} ${activeQuote.fromToken} = ${activeQuote.receiveAmount} ${activeQuote.toToken}`
                  : "Choose two different tokens and enter an amount to build a quote."}
              </div>

              {swapDisabledReason ? (
                <div className="rounded-[20px] border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-100">
                  {swapDisabledReason}
                </div>
              ) : null}

              <button
                type="button"
                onClick={onExecuteSwap}
                disabled={swapLoading || quoteLoading || Boolean(swapDisabledReason)}
                className="btn-gold w-full justify-center disabled:pointer-events-none disabled:opacity-60"
              >
                {swapLoading
                  ? "Submitting..."
                  : quoteLoading
                    ? "Pricing..."
                    : connected
                      ? "Swap in MiniMask"
                      : "Connect Wallet"}
              </button>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="rounded-[24px] border border-white/10 bg-black/45 p-4">
                <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-white/55">
                  Recipient
                </p>
                <input
                  value={sendForm.address}
                  onChange={(event) => onSetSendField("address", event.target.value)}
                  placeholder="Mx... or 0x..."
                  className="input-premium mt-4 !rounded-[18px] !border-white/10 !bg-[#151515] !text-white"
                />
              </div>

              <div className="rounded-[24px] border border-white/10 bg-black/45 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-white/55">
                    Amount
                  </p>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-ma-gold">
                    Sendable {formatDisplayedAmount(sendSourceBalance)} {sendForm.token}
                  </p>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px]">
                  <input
                    type="number"
                    min="0"
                    step="0.0001"
                    value={sendForm.amount}
                    onChange={(event) => onSetSendField("amount", event.target.value)}
                    className="w-full bg-transparent text-4xl font-black text-white outline-none placeholder:text-white/20"
                    placeholder="0.0"
                  />
                  <select
                    value={sendForm.token}
                    onChange={(event) => onSetSendField("token", event.target.value)}
                    className="input-premium !rounded-[18px] !border-white/10 !bg-[#151515] !text-white"
                  >
                    {availableTokens.map((token) => (
                      <option key={token} value={token}>
                        {token}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {sendDisabledReason ? (
                <div className="rounded-[20px] border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-100">
                  {sendDisabledReason}
                </div>
              ) : null}

              <button
                type="button"
                onClick={onExecuteSend}
                disabled={sendLoading || Boolean(sendDisabledReason)}
                className="btn-gold w-full justify-center disabled:pointer-events-none disabled:opacity-60"
              >
                {sendLoading
                  ? "Submitting..."
                  : connected
                    ? "Send in MiniMask"
                    : "Connect Wallet"}
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
}
