import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGlobalState } from '../context/GlobalStateContext';
import { useLedger } from '../hooks/useLedger';
import { usePayout } from '../hooks/usePayout';

const PROOF_SERVER_CMD =
  'docker run --platform linux/amd64 -p 6300:6300 midnightntwrk/proof-server:2.0.8';

export function PayoutPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { wallet } = useGlobalState();
  const call = usePayout();
  const ledgerState = useLedger();

  const connected = wallet.status === 'connected' && wallet.connection;
  const { phase, proofServer, result, error, hasContract } = call;
  const busy = phase === 'checking' || phase === 'proving';

  // Mocked member index (same as Dashboard)
  const mockedMemberIndex = 2;
  const currentRecipientIndex = ledgerState.ledger ? Number(ledgerState.ledger.currentRecipientIndex) : 0;
  
  const isMyTurn = connected && currentRecipientIndex === mockedMemberIndex;
  const poolSolvent = ledgerState.ledger ? ledgerState.ledger.poolSolvent : false;
  const poolTotal = ledgerState.ledger ? ledgerState.ledger.poolTotal.toString() : '0';

  const canClaim = isMyTurn && poolSolvent;
  const canSubmit = connected && !busy && canClaim;

  const onSubmit = async () => {
    if (!connected) return;
    await call.claimPayout(wallet.connection!, id as string);
    if (ledgerState.hasAddress) void ledgerState.refresh();
  };

  return (
    <div className="page-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <button className="small ghost" onClick={() => navigate(`/circles/${id}`)} style={{ marginBottom: '12px' }}>
            &larr; Back to Dashboard
          </button>
          <h1>💸 Claim Payout</h1>
          <p style={{ opacity: 0.8, fontFamily: 'monospace' }}>Contract: {id}</p>
        </div>
      </div>

      <section className="panel">
        {!isMyTurn ? (
          <div className="notice warn" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <h3 style={{ margin: '0 0 12px 0' }}>Not Your Turn Yet</h3>
            <p style={{ margin: 0, opacity: 0.8 }}>
              The current cycle's payout is reserved for member <strong>#{currentRecipientIndex + 1}</strong>.
              You are recognized as member <strong>#{mockedMemberIndex + 1}</strong>.
            </p>
          </div>
        ) : !poolSolvent ? (
          <div className="notice err" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <h3 style={{ margin: '0 0 12px 0' }}>Pool Insolvent</h3>
            <p style={{ margin: 0, opacity: 0.8 }}>
              It is your turn, but the circle has not met the required share threshold for this cycle yet.
            </p>
          </div>
        ) : (
          <div>
            <div className="notice" style={{ borderColor: 'var(--ok)', background: 'rgba(31,81,54,0.1)', textAlign: 'center', padding: '24px' }}>
              <h2 style={{ margin: '0 0 8px 0', color: 'var(--ok)' }}>It's Your Turn!</h2>
              <p style={{ margin: 0, opacity: 0.9 }}>
                The pool is fully solvent and you are the designated recipient for this cycle.
              </p>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '16px', color: '#4c8dff' }}>
                {poolTotal} tNIGHT
              </div>
              <div className="small muted">Total claimable pool balance</div>
            </div>

            <ProofServerRow status={proofServer} onRecheck={call.recheckProofServer} />

            <div className="row spread" style={{ marginTop: 24 }}>
              <div>
                {!connected && <span className="small muted">Connect your Lace wallet to participate.</span>}
                {connected && !hasContract && (
                  <span className="small muted ok">Client ZK Proof Simulation Active</span>
                )}
              </div>
              <button className="primary" onClick={onSubmit} disabled={!canSubmit}>
                {phase === 'checking'
                  ? 'Verifying Engine…'
                  : phase === 'proving'
                    ? 'Generating ZK Proof…'
                    : 'Claim Entire Pool'}
              </button>
            </div>
          </div>
        )}

        {/* Result / feedback */}
        {phase === 'done' && result && (
          <div className="notice" style={{ marginTop: 24, borderColor: '#1f5136', background: 'rgba(31,81,54,0.15)' }}>
            <div>
              ✅ <strong>Payout Claimed!</strong> You have successfully rotated the circle and claimed the pool.
            </div>
            <div className="small muted" style={{ marginTop: 4 }}>
              Transaction Hash: <span className="mono">{result.txId}</span>
            </div>
          </div>
        )}
        {phase === 'error' && error && (
          <div className="notice err" style={{ marginTop: 24 }}>
            {error}
          </div>
        )}
      </section>
    </div>
  );
}

function ProofServerRow({
  status,
  onRecheck,
}: {
  status: 'up' | 'down' | 'unknown';
  onRecheck: () => Promise<void>;
}) {
  const [copied, setCopied] = useState(false);
  const cls = status === 'up' ? 'ok' : status === 'down' ? 'off' : 'warn';
  const label =
    status === 'up'
      ? 'Zero-Knowledge Proof Engine Active'
      : status === 'down'
        ? 'Proof Engine Standby'
        : 'Checking Proof Engine…';

  return (
    <div className="notice warn" style={{ marginTop: 24 }}>
      <div className="row spread">
        <span className={`badge ${cls}`}>
          <span className="dot" />
          {label}
        </span>
        <button className="small ghost" onClick={onRecheck}>
          Re-check
        </button>
      </div>
      {status !== 'up' && (
        <details style={{ marginTop: 10 }}>
          <summary className="small muted" style={{ cursor: 'pointer' }}>
            Show local proof engine startup command
          </summary>
          <div className="row" style={{ gap: 8, marginTop: 8 }}>
            <code className="addr" style={{ flex: 1, overflowX: 'auto', whiteSpace: 'nowrap' }}>
              {PROOF_SERVER_CMD}
            </code>
            <button
              className="small"
              onClick={async () => {
                await navigator.clipboard.writeText(PROOF_SERVER_CMD);
                setCopied(true);
                setTimeout(() => setCopied(false), 1200);
              }}
            >
              {copied ? 'Copied ✓' : 'Copy'}
            </button>
          </div>
        </details>
      )}
    </div>
  );
}
