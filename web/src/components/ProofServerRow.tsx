import { useState } from 'react';

// Local Midnight proof server launch command. The circuit-CALL (Tier C) path
// needs this running on localhost:6300; it is intentionally not part of the
// deployed demo.
export const PROOF_SERVER_CMD =
  'docker run --platform linux/amd64 -p 6300:6300 midnightntwrk/proof-server:2.0.8';

// Shared status row for the ZK proof engine — previously duplicated verbatim
// inside both DepositPage and PayoutPage.
export function ProofServerRow({
  status,
  onRecheck,
  style,
}: {
  status: 'up' | 'down' | 'unknown';
  onRecheck: () => Promise<void>;
  style?: React.CSSProperties;
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
    <div className="notice warn" style={{ marginTop: 12, ...style }}>
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
