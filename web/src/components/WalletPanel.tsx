import { useState } from 'react';
import type { UseWallet } from '../hooks/useWallet';
import { truncateMiddle, copyToClipboard } from '../util/format';

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
          <h2><span>👛</span> Wallet Connection</h2>
          <p className="sub">Manage your Midnight Lace wallet connection and network address.</p>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Action Row */}
      <div className="row" style={{ marginTop: 4 }}>
        {status !== 'connected' ? (
          <button
            className="primary"
            onClick={connect}
            disabled={status === 'connecting'}
          >
            {status === 'connecting'
              ? 'Connecting…'
              : 'Connect Lace Wallet'}
          </button>
        ) : (
          <button className="danger small" onClick={disconnect}>
            Disconnect Wallet
          </button>
        )}
        {(status === 'unavailable' || status === 'error') && (
          <button className="ghost small" onClick={() => void redetect()}>
            Re-scan Extension
          </button>
        )}
        {status === 'unavailable' && (
          <a
            href="https://midnight.network/tools/midnight-lace"
            target="_blank"
            rel="noreferrer"
            className="small muted"
          >
            Get Midnight Lace Extension →
          </a>
        )}
      </div>

      {/* Messages */}
      {status === 'detecting' && (
        <div className="notice" style={{ marginTop: 14 }}>
          <span className="spinner" /> Looking for Midnight Lace wallet extension…
        </div>
      )}
      {status === 'unavailable' && (
        <div className="notice warn" style={{ marginTop: 14 }}>
          Midnight Lace wallet extension not detected. Please install <strong>Midnight Lace</strong>, set it to the <strong>Preprod</strong> network, then click <strong>Connect Lace Wallet</strong> above.
        </div>
      )}
      {error && (
        <div className="notice warn" style={{ marginTop: 14 }}>
          {error.includes('lace.io') ? (
            <>
              Lace wallet not detected — install it from{' '}
              <a href="https://www.lace.io/" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>
                lace.io
              </a>
              . Ensure it is enabled and set to the Preprod network.
            </>
          ) : (
            error
          )}
        </div>
      )}
      {hint && status !== 'connected' && (
        <div className="notice" style={{ marginTop: 14 }}>
          {hint}
        </div>
      )}

      {/* Connected details */}
      {status === 'connected' && connection && (
        <div style={{ marginTop: 16 }}>
          <div className="kv">
            <div className="k">Wallet Provider</div>
            <div style={{ fontWeight: 600 }}>
              {connection.walletName}{' '}
              <span className="muted small">
                (v{connection.apiVersion})
              </span>
            </div>

            <div className="k">Your Address</div>
            <div className="row" style={{ gap: 8 }}>
              <span className="addr mono" title={connection.state.address}>
                {truncateMiddle(connection.state.address, 14, 10)}
              </span>
              <button
                className="small ghost"
                onClick={() => copy('address', connection.state.address)}
              >
                {copied === 'address' ? 'Copied ✓' : 'Copy'}
              </button>
            </div>

            <div className="k">Coin Public Key</div>
            <div className="addr mono" title={connection.state.coinPublicKey}>
              {truncateMiddle(connection.state.coinPublicKey, 14, 10)}
            </div>

            {balanceEntries.length > 0 && (
              <>
                <div className="k">Available Balance</div>
                <div className="mono small" style={{ fontWeight: 700, color: 'var(--ok)' }}>
                  {balanceEntries
                    .map(([token, amt]) => `${String(amt)} ${token}`)
                    .join(' · ')}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Collapseable Debug Info */}
      <details style={{ marginTop: 16 }}>
        <summary className="muted small" style={{ cursor: 'pointer' }}>
          Technical Network & Diagnostic Info
        </summary>
        <div className="kv" style={{ marginTop: 12 }}>
          <div className="k">Injected Extension</div>
          <div className="mono small">{injection.hasMidnight ? 'Detected' : 'Not Found'}</div>
          <div className="k">Detected Keys</div>
          <div className="mono small">
            {injection.keys.length ? injection.keys.join(', ') : 'None'}
          </div>
          <div className="k">Active Key</div>
          <div className="mono small">{injection.chosenKey ?? 'None'}</div>
          {connection && (
            <>
              <div className="k">Node Endpoint</div>
              <div className="mono small">{connection.uris.nodeUri}</div>
              <div className="k">Indexer Endpoint</div>
              <div className="mono small">{connection.uris.indexerUri}</div>
            </>
          )}
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
    idle: { cls: 'off', label: 'Not Connected' },
    unavailable: { cls: 'off', label: 'Extension Standby' },
    error: { cls: 'warn', label: 'Connection Error' },
  } as const;
  const { cls, label } = map[status];
  return (
    <span className={`badge ${cls}`}>
      <span className="dot" />
      {label}
    </span>
  );
}
