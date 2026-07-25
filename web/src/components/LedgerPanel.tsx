import type { UseLedger } from '../hooks/useLedger';
import { CONTRACT_ADDRESS } from '../config/network';
import { truncateMiddle } from '../util/format';

// ═══════════════════════════════════════════════════════════════════════
// LedgerPanel — the public, on-chain state anyone can see. This is the
// "observable" half of "observable privacy": everything shown here is
// disclosed, and NONE of it is any member's private contribution amount.
// ═══════════════════════════════════════════════════════════════════════

export function LedgerPanel({ ledger: L }: { ledger: UseLedger }) {
  const { ledger, error, loading, hasAddress, refresh } = L;

  return (
    <section className="panel">
      <div className="row spread">
        <div>
          <h2>On-chain ledger</h2>
          <p className="sub">
            Public state on Midnight Preprod — read from the indexer, no proof
            server needed.
          </p>
        </div>
        <button onClick={refresh} disabled={loading || !hasAddress}>
          {loading ? 'Reading…' : 'Refresh'}
        </button>
      </div>

      {hasAddress && (
        <div className="small muted" style={{ marginBottom: 12 }}>
          Contract <span className="mono">{truncateMiddle(CONTRACT_ADDRESS, 12, 10)}</span>
        </div>
      )}

      {/* Not deployed yet → explain rather than error out. */}
      {!hasAddress && (
        <div className="notice warn">
          No contract address configured yet. Deploy in Phase 2, then set{' '}
          <code>VITE_VAULT_CIRCLE_ADDRESS</code> (or fill{' '}
          <code>CONTRACT_ADDRESS</code> in <code>config/network.ts</code>) to
          read the live ledger. The privacy demo below works without it.
        </div>
      )}

      {error && hasAddress && (
        <div className={`notice ${error.kind === 'deps-missing' ? 'warn' : 'err'}`}>
          {error.message}
        </div>
      )}

      {ledger && (
        <div className="kv" style={{ marginTop: 4 }}>
          <div className="k">Required share</div>
          <div className="mono">{ledger.requiredShare.toString()}</div>

          <div className="k">Contributions</div>
          <div className="mono">{ledger.contributionsCount.toString()}</div>

          <div className="k">Pool total</div>
          <div className="mono">
            {ledger.poolTotal.toString()}{' '}
            <span className="muted small">
              (= requiredShare × {ledger.contributionsCount.toString()})
            </span>
          </div>

          <div className="k">Last contribution met?</div>
          <div>
            <span className={`badge ${ledger.contributionMet ? 'ok' : 'off'}`}>
              <span className="dot" />
              {ledger.contributionMet ? 'met' : 'not met'}
            </span>
          </div>
        </div>
      )}

      {ledger && (
        <p className="small muted" style={{ marginTop: 14 }}>
          Note what is <strong>not</strong> here: no member's actual contribution
          amount. The pool grows by the public <code>requiredShare</code>, never
          by anyone's secret figure.
        </p>
      )}
    </section>
  );
}
