import type { UseLedger } from '../hooks/useLedger';
import { CONTRACT_ADDRESS } from '../config/network';
import { truncateMiddle } from '../util/format';

export function LedgerPanel({ ledger: L }: { ledger: UseLedger }) {
  const { ledger, error, loading, hasAddress, refresh } = L;

  return (
    <section className="panel">
      <div className="row spread">
        <div>
          <h2><span>📊</span> Public Pool Ledger</h2>
          <p className="sub">
            Real-time public ledger data read from Midnight indexer.
          </p>
        </div>
        <button className="small ghost" onClick={refresh} disabled={loading || !hasAddress}>
          {loading ? 'Reading…' : 'Refresh State'}
        </button>
      </div>

      {hasAddress && (
        <div className="small muted" style={{ marginBottom: 14 }}>
          Contract Address: <span className="mono">{truncateMiddle(CONTRACT_ADDRESS, 12, 10)}</span>
        </div>
      )}

      {!hasAddress && (
        <div className="notice warn">
          ℹ️ <strong>Demo Environment:</strong> No live contract address configured. Contract code & ZK circuits are fully compiled and verified locally.
        </div>
      )}

      {error && hasAddress && (
        <div className={`notice ${error.kind === 'deps-missing' ? 'warn' : 'err'}`}>
          {error.message}
        </div>
      )}

      {ledger && (
        <div className="kv" style={{ marginTop: 12 }}>
          <div className="k">Monthly Target Share</div>
          <div className="mono" style={{ fontWeight: 700 }}>{ledger.requiredShare.toString()} tNIGHT</div>

          <div className="k">Total Circle Members</div>
          <div className="mono" style={{ fontWeight: 700 }}>{ledger.memberCount.toString()}</div>

          <div className="k">Current Cycle Epoch</div>
          <div className="mono" style={{ fontWeight: 700 }}>{(ledger.cycleCount + 1n).toString()}</div>

          <div className="k">Deposits This Cycle</div>
          <div className="mono" style={{ fontWeight: 700 }}>
            {ledger.membersContributedThisCycle.toString()} / {ledger.memberCount.toString()}
          </div>

          <div className="k">Pooled Total</div>
          <div className="mono" style={{ fontWeight: 700, color: '#4c8dff' }}>
            {ledger.poolTotal.toString()} tNIGHT
          </div>

          <div className="k">Pool Solvency Status</div>
          <div>
            <span className={`badge ${ledger.poolSolvent ? 'ok' : 'danger'}`}>
              <span className="dot" />
              {ledger.poolSolvent ? 'Solvent' : 'Insolvent (Disputed)'}
            </span>
          </div>
        </div>
      )}

      {ledger && (
        <div className="small muted" style={{ marginTop: 18, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
          🛡️ <strong>Privacy Protection Active:</strong> Notice that no member's personal contribution figure appears here. The pool total updates strictly by the agreed share amount.
        </div>
      )}
    </section>
  );
}
