import StatusPanel from "../components/StatusPanel";
import TransactionHistory from "../components/TransactionHistory";
import { useMiniMask } from "../hooks/useMiniMask";
import { useSwapDex } from "../hooks/useSwapDex";
import { getOwnedTokenBalances } from "../services/walletPortfolio";

export default function Transactions() {
  const { address, refresh, send, sendableBalances } = useMiniMask();
  const dex = useSwapDex({
    address,
    refreshWallet: refresh,
    send,
    sendableBalances
  });
  const ownedTokenBalances = getOwnedTokenBalances(sendableBalances);

  return (
    <div className="space-y-6">
      <section className="panel-surface p-6">
        <p className="section-kicker">Confirmation Flow</p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-slate-900 dark:text-white">
          Real MiniMask transaction tracking
        </h2>
        <div className="mt-6 grid gap-4">
          <div className="surface-muted p-4 font-semibold text-slate-700 dark:text-slate-200">
            Swap requests and wallet sends are signed locally in MiniMask and submitted from your
            browser.
          </div>
          <div className="surface-muted p-4 font-semibold text-slate-700 dark:text-slate-200">
            The app reads sendable balances first, so zero-balance tokens cannot be submitted by
            accident.
          </div>
          <div className="surface-muted p-4 font-semibold text-slate-700 dark:text-slate-200">
            Every activity card stays in Submitted, then Processing, and only moves to Success
            after `checktxpow` reports chain confirmation.
          </div>
        </div>
      </section>

      <StatusPanel
        connected={Boolean(address)}
        hasSpendableFunds={ownedTokenBalances.length > 0}
        ownedTokenCount={ownedTokenBalances.length}
        status={dex.status}
        transactionFlow={dex.transactionFlow}
      />

      <TransactionHistory
        error={dex.historyError}
        items={dex.history}
        loading={dex.historyLoading}
      />
    </div>
  );
}
