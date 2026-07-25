import { useState } from 'react';
import type { UseWallet } from '../hooks/useWallet';
import { truncateMiddle, copyToClipboard } from '../util/format';

// ═══════════════════════════════════════════════════════════════════════
// WalletPanel — connect / disconnect + connected identity and the service
// URIs the wallet reports. Renders one of six states from useWallet()
// (detecting / unavailable / idle / connecting / connected / error) and
// exposes an injection-debug drawer + re-scan so wallet-detection issues are
// diagnosable in the field.
// ═══════════════════════════════════════════════════════════════════════

export function WalletPanel({ wallet }: { wallet: UseWallet }) {
  const { status, connection, error, hint, injection, connect, disconnect, redetect } =
    wallet;
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (label: string, value: string) => {
    if (await copyToClipboard(value)) {
      setCopied(label);
      setTimeout(() => setCopied(null), 1200);
    }
  };

  const balances = connection?.state.balances;
  const balanceEntries = balances ? Object.entries(balances) : [];

  return (
    <section className="panel">
      <div className="row spread">
        <div>
          <h2>Wallet</h2>
          <p className="sub">Connect Lace on Midnight Preprod.</p>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* ── Action row ── */}
      <div className="row" style={{ marginTop: 4 }}>
        {status !== 'connected' ? (
          <button
            className="primary"
            onClick={connect}
            disabled={status === 'connecting'}
          >
            {status === 'connecting'
              ? 'Connecting…'
              : 'Connect Lace'}
          </button>
        ) : (
          <button className="danger" onClick={disconnect}>
            Disconnect
          </button>
        )}
        {(status === 'unavailable' || status === 'error') && (
          <button className="ghost" onClick={() => void redetect()}>
            Re-scan
          </button>
        )}
        {status === 'unavailable' && (
          <a
            href="https://www.lace.io/"
            target="_blank"
            rel="noreferrer"
            className="small muted"
          >
            Get the Lace extension →
          </a>
        )}
      </div>

      {/* ── Messages ── */}
      {status === 'detecting' && (
        <div className="notice" style={{ marginTop: 12 }}>
          <span className="spinner" /> Looking for an injected Midnight wallet…
        </div>
      )}
      {status === 'unavailable' && (
        <div className="notice warn" style={{ marginTop: 12 }}>
          No Midnight wallet detected. Install <strong>Lace</strong>, switch it
          to the <strong>Preprod</strong> network, then reload this page.
        </div>
      )}
      {error && (
        <div className="notice warn" style={{ marginTop: 12 }}>
          {error}
        </div>
      )}
      {hint && status !== 'connected' && (
        <div className="notice" style={{ marginTop: 12 }}>
          {hint}
        </div>
      )}

      {/* ── Connected details ── */}
      {status === 'connected' && connection && (
        <div style={{ marginTop: 16 }}>
          <div className="kv">
            <div className="k">Wallet</div>
            <div>
              {connection.walletName}{' '}
              <span className="muted small">
                (connector v{connection.apiVersion} · key {connection.connectorKey})
              </span>
            </div>

            <div className="k">Address</div>
            <div className="row" style={{ gap: 8 }}>
              <span className="addr mono" title={connection.state.address}>
                {truncateMiddle(connection.state.address, 14, 10)}
              </span>
              <button
                className="small"
                style={{ padding: '4px 10px' }}
                onClick={() => copy('address', connection.state.address)}
              >
                {copied === 'address' ? 'Copied ✓' : 'Copy'}
              </button>
            </div>

            <div className="k">Coin public key</div>
            <div className="addr mono" title={connection.state.coinPublicKey}>
              {truncateMiddle(connection.state.coinPublicKey, 14, 10)}
            </div>

            {balanceEntries.length > 0 && (
              <>
                <div className="k">Balance</div>
                <div className="mono small">
                  {balanceEntries
                    .map(([token, amt]) => `${String(amt)} ${token}`)
                    .join(' · ')}
                </div>
              </>
            )}
          </div>

          <details style={{ marginTop: 14 }}>
            <summary className="muted small" style={{ cursor: 'pointer' }}>
              Service endpoints (as reported by the wallet)
            </summary>
            <div className="kv" style={{ marginTop: 10 }}>
              <div className="k">Node</div>
              <div className="mono small">{connection.uris.nodeUri}</div>
              <div className="k">Indexer</div>
              <div className="mono small">{connection.uris.indexerUri}</div>
              <div className="k">Proof server</div>
              <div className="mono small">{connection.uris.proverServerUri}</div>
            </div>
          </details>
        </div>
      )}

      {/* ── Injection debug drawer ── always available for diagnosis. */}
      <details style={{ marginTop: 14 }}>
        <summary className="muted small" style={{ cursor: 'pointer' }}>
          Wallet injection debug
        </summary>
        <div className="kv" style={{ marginTop: 10 }}>
          <div className="k">window.midnight</div>
          <div className="mono small">{injection.hasMidnight ? 'present' : 'absent'}</div>
          <div className="k">Keys</div>
          <div className="mono small">
            {injection.keys.length ? injection.keys.join(', ') : '—'}
          </div>
          <div className="k">Chosen key</div>
          <div className="mono small">{injection.chosenKey ?? '—'}</div>
        </div>
      </details>
    </section>
  );
}

function StatusBadge({ status }: { status: UseWallet['status'] }) {
  const map = {
    detecting: { cls: 'warn', label: 'Detecting' },
    connected: { cls: 'ok', label: 'Connected' },
    connecting: { cls: 'warn', label: 'Connecting' },
    idle: { cls: 'off', label: 'Not connected' },
    unavailable: { cls: 'off', label: 'No wallet' },
    error: { cls: 'warn', label: 'Error' },
  } as const;
  const { cls, label } = map[status];
  return (
    <span className={`badge ${cls}`}>
      <span className="dot" />
      {label}
    </span>
  );
}
