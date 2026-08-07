import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGlobalState } from '../context/GlobalStateContext';
import { useContribute } from '../hooks/useContribute';
import { useLedger } from '../hooks/useLedger';
import { isDemoCircle, DEMO_CIRCLE } from '../config/demo';

const PROOF_SERVER_CMD =
  'docker run --platform linux/amd64 -p 6300:6300 midnightntwrk/proof-server:2.0.8';

export function DepositPage() { 
  const { id } = useParams();
  const navigate = useNavigate();
  const { wallet } = useGlobalState();
  const call = useContribute();
  const ledger = useLedger();
  const isDemo = isDemoCircle(id);

  const [amount, setAmount] = useState('100');
  const connected = wallet.status === 'connected' && wallet.connection;
  const { phase, proofServer, result, error, hasContract } = call;

  // Demo simulation state
  const [demoPhase, setDemoPhase] = useState<'idle' | 'proving' | 'done'>('idle');
  const [demoResult, setDemoResult] = useState<{ shareMet: boolean; txId: string } | null>(null);

  const busy = isDemo ? demoPhase === 'proving' : (phase === 'checking' || phase === 'proving');
  const canSubmit = !!connected && !busy && amount.trim() !== '';

  const onSubmit = async () => {
    if (!connected) return;
    if (isDemo) {
      // Simulate ZK proof generation
      setDemoPhase('proving');
      setDemoResult(null);
      await new Promise((r) => setTimeout(r, 2200));
      const parsed = BigInt(amount.trim() || '0');
      setDemoResult({
        shareMet: parsed >= DEMO_CIRCLE.requiredShare,
        txId: '0x' + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      });
      setDemoPhase('done');
      return;
    }
    let parsed: bigint;
    try {
      parsed = BigInt(amount.trim());
    } catch {
      return;
    }
    await call.contribute(wallet.connection!, parsed);
    if (ledger.hasAddress) void ledger.refresh();
  };

  return (
    <div className="page-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <button className="small ghost" onClick={() => navigate(`/circles/${id}`)} style={{ marginBottom: '12px' }}>
            &larr; Back to Dashboard
          </button>
          <h1>💳 Deposit to Circle</h1>
          <p style={{ opacity: 0.8, fontFamily: 'monospace' }}>Contract: {id}</p>
        </div>
      </div>

      <section className="panel">
        <p className="sub">
          Contribute your cycle share with 100% financial privacy.
        </p>

        {/* Network Proof Engine Status */}
        {isDemo ? (
          <div className="notice" style={{ marginTop: 12, borderColor: 'rgba(52, 211, 153, 0.3)', background: 'rgba(52, 211, 153, 0.06)' }}>
            <div className="row spread">
              <span className="badge ok">
                <span className="dot" />
                Demo Mode — ZK Proof Simulation Active
              </span>
            </div>
          </div>
        ) : (
          <ProofServerRow status={proofServer} onRecheck={call.recheckProofServer} />
        )}

        {/* Inline Explainer */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '24px', padding: '16px', background: 'var(--panel-2)', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--ok)', marginBottom: '4px', fontWeight: 600 }}>🔒 What Stays Hidden</div>
            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.8 }}>Your exact deposit amount is encrypted on your device. Other members cannot see how much you deposited.</p>
          </div>
          <div style={{ width: '1px', background: 'var(--border)' }}></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--accent-blue)', marginBottom: '4px', fontWeight: 600 }}>👁 What is Proven</div>
            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.8 }}>The ZK Proof only verifies that you met the required share threshold (<code>shareMet: true/false</code>).</p>
          </div>
        </div>

        {/* Encrypted Input Field */}
        <div style={{ marginTop: 24 }}>
          <label className="secret-strip" style={{ display: 'block' }}>
            <div className="small muted" style={{ marginBottom: 8, fontWeight: 600 }}>
              🔒 Your Deposit Amount
            </div>
            <input
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={busy}
              placeholder="Enter deposit amount (e.g. 100)"
              style={{ width: '100%' }}
            />
          </label>
        </div>

        <div className="row spread" style={{ marginTop: 24 }}>
          <div>
            {!connected && <span className="small muted">Connect your Lace wallet to participate.</span>}
            {connected && !hasContract && (
              <span className="small muted ok">Client ZK Proof Simulation Active</span>
            )}
          </div>
          <button className="primary" onClick={onSubmit} disabled={!canSubmit}>
            {isDemo
              ? (demoPhase === 'proving' ? 'Generating ZK Proof…' : 'Deposit & Prove Share')
              : phase === 'checking'
                ? 'Verifying Engine…'
                : phase === 'proving'
                  ? 'Generating ZK Proof…'
                  : 'Deposit & Prove Share'}
          </button>
        </div>

        {/* Result / feedback */}
        {isDemo && demoPhase === 'done' && demoResult && (
          <div className="notice" style={{ marginTop: 24, borderColor: '#1f5136', background: 'rgba(31,81,54,0.15)' }}>
            <div>
              ✅ <strong>Deposit Verified!</strong> Proof accepted by network. Disclosed result:{' '}
              <code>shareMet = {String(demoResult.shareMet)}</code>.
            </div>
            <div className="small muted" style={{ marginTop: 4 }}>
              Transaction Hash: <span className="mono">{demoResult.txId}</span>
            </div>
          </div>
        )}
        {!isDemo && phase === 'done' && result && (
          <div className="notice" style={{ marginTop: 24, borderColor: '#1f5136', background: 'rgba(31,81,54,0.15)' }}>
            <div>
              ✅ <strong>Deposit Verified!</strong> Proof accepted by network. Disclosed result:{' '}
              <code>shareMet = {String(result.returnValue)}</code>.
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
    <div className="notice warn" style={{ marginTop: 12 }}>
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
