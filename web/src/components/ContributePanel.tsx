import { useState } from 'react';
import type { UseWallet } from '../hooks/useWallet';
import type { UseContribute } from '../hooks/useContribute';
import type { UseLedger } from '../hooks/useLedger';

// ═══════════════════════════════════════════════════════════════════════
// ContributePanel — call the contribute() circuit from the UI.
//
// The member types their PRIVATE amount. On submit we prove amount >=
// requiredShare and disclose only the boolean. This panel also surfaces the
// proof-server precondition (Lace's "mandatory network requirement") as an
// explicit, checkable status with the exact Docker command.
// ═══════════════════════════════════════════════════════════════════════

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
    // Refresh the public ledger so the effect (count/pool/met) is visible.
    if (ledger.hasAddress) void ledger.refresh();
  };

  return (
    <section className="panel">
      <h2>Contribute (call a circuit)</h2>
      <p className="sub">
        Prove your contribution meets the required share — without revealing the
        amount.
      </p>

      {/* Proof-server status — the "mandatory network requirement". */}
      <ProofServerRow status={proofServer} onRecheck={call.recheckProofServer} />

      {/* The private input. */}
      <div className="row" style={{ marginTop: 16 }}>
        <label className="secret-strip" style={{ flex: 1 }}>
          <div className="small muted" style={{ marginBottom: 6 }}>
            🔒 Your contribution amount — <strong>private witness</strong>, never
            written on-chain
          </div>
          <input
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={busy}
          />
        </label>
      </div>

      <div className="row" style={{ marginTop: 14 }}>
        <button className="primary" onClick={onSubmit} disabled={!canSubmit}>
          {phase === 'checking'
            ? 'Checking proof server…'
            : phase === 'proving'
              ? 'Proving & submitting…'
              : 'contribute()'}
        </button>
        {!connected && <span className="small muted">Connect a wallet first.</span>}
        {connected && !hasContract && (
          <span className="small muted">Deploy the contract to enable.</span>
        )}
      </div>

      {/* Result / errors. */}
      {phase === 'done' && result && (
        <div className="notice" style={{ marginTop: 14, borderColor: '#1f5136' }}>
          <div>
            ✅ Circuit call finalized. Disclosed result{' '}
            <code>met = {String(result.returnValue)}</code>.
          </div>
          <div className="small muted" style={{ marginTop: 4 }}>
            tx <span className="mono">{result.txId}</span>. The chain learned{' '}
            <em>whether</em> you met the share — not your amount.
          </div>
        </div>
      )}
      {phase === 'error' && error && (
        <div className="notice err" style={{ marginTop: 14 }}>
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
      ? 'Proof server reachable'
      : status === 'down'
        ? 'Proof server not reachable'
        : 'Proof server status unknown';

  return (
    <div className="notice warn" style={{ marginTop: 4 }}>
      <div className="row spread">
        <span className={`badge ${cls}`}>
          <span className="dot" />
          {label}
        </span>
        <button className="small" style={{ padding: '4px 10px' }} onClick={onRecheck}>
          Re-check
        </button>
      </div>
      <p className="small" style={{ margin: '10px 0 6px' }}>
        Submitting a circuit generates a ZK proof, which Midnight routes to a
        local proof server — this is Lace's <strong>mandatory network
        requirement</strong>. Start it in a separate terminal:
      </p>
      <div className="row" style={{ gap: 8 }}>
        <code
          className="addr"
          style={{ flex: 1, overflowX: 'auto', whiteSpace: 'nowrap' }}
        >
          {PROOF_SERVER_CMD}
        </code>
        <button
          className="small"
          style={{ padding: '4px 10px' }}
          onClick={async () => {
            await navigator.clipboard.writeText(PROOF_SERVER_CMD);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
          }}
        >
          {copied ? 'Copied ✓' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
