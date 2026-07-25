import { useState } from 'react';
import type { UseWallet } from '../hooks/useWallet';
import type { UseContribute } from '../hooks/useContribute';
import type { UseLedger } from '../hooks/useLedger';

const PROOF_SERVER_CMD =
  'docker run --platform linux/amd64 -p 6300:6300 midnightntwrk/proof-server:2.0.8';

export function ContributePanel({
  wallet,
  call,
  ledger,
}: {
  wallet: UseWallet;
  call: UseContribute;
  ledger: UseLedger;
}) {
  const [amount, setAmount] = useState('100');
  const connected = wallet.status === 'connected' && wallet.connection;
  const { phase, proofServer, result, error, hasContract } = call;

  const busy = phase === 'checking' || phase === 'proving';
  const canSubmit = !!connected && hasContract && !busy && amount.trim() !== '';

  const onSubmit = async () => {
    if (!connected) return;
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
    <section className="panel">
      <h2><span>💳</span> Deposit to Circle</h2>
      <p className="sub">
        Contribute your monthly share with 100% financial privacy. Zero-knowledge proofs verify you met the share threshold without revealing your exact deposit amount.
      </p>

      {/* Network Proof Engine Status */}
      <ProofServerRow status={proofServer} onRecheck={call.recheckProofServer} />

      {/* Encrypted Input Field */}
      <div style={{ marginTop: 18 }}>
        <label className="secret-strip" style={{ display: 'block' }}>
          <div className="small muted" style={{ marginBottom: 8, fontWeight: 600 }}>
            🔒 Your Deposit Amount — <strong>Encrypted Client-Side</strong> (Never visible on-chain)
          </div>
          <input
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={busy}
            placeholder="Enter deposit amount (e.g. 100)"
          />
        </label>
      </div>

      <div className="row" style={{ marginTop: 18 }}>
        <button className="primary" onClick={onSubmit} disabled={!canSubmit}>
          {phase === 'checking'
            ? 'Verifying Engine…'
            : phase === 'proving'
              ? 'Generating ZK Proof…'
              : 'Deposit & Prove Share'}
        </button>
        {!connected && <span className="small muted">Connect your Lace wallet to participate.</span>}
        {connected && !hasContract && (
          <span className="small muted">Awaiting contract deployment.</span>
        )}
      </div>

      {/* Result / feedback */}
      {phase === 'done' && result && (
        <div className="notice" style={{ marginTop: 16, borderColor: '#1f5136', background: 'rgba(31,81,54,0.15)' }}>
          <div>
            ✅ <strong>Deposit Verified!</strong> Proof accepted by network. Disclosed result:{' '}
            <code>shareMet = {String(result.returnValue)}</code>.
          </div>
          <div className="small muted" style={{ marginTop: 4 }}>
            Transaction Hash: <span className="mono">{result.txId}</span>. The public blockchain only learned that you met your required deposit.
          </div>
        </div>
      )}
      {phase === 'error' && error && (
        <div className="notice err" style={{ marginTop: 16 }}>
          {error}
        </div>
      )}
    </section>
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
    <div className="notice warn" style={{ marginTop: 6 }}>
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
