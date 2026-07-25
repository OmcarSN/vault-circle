import { useWallet } from './hooks/useWallet';
import { useLedger } from './hooks/useLedger';
import { useContribute } from './hooks/useContribute';
import { WalletPanel } from './components/WalletPanel';
import { LedgerPanel } from './components/LedgerPanel';
import { ContributePanel } from './components/ContributePanel';
import { PrivacyDemo } from './components/PrivacyDemo';
import { ACTIVE_NETWORK } from './config/network';

export function App() {
  const wallet = useWallet();
  const ledger = useLedger();
  const call = useContribute();

  const isConnected = wallet.status === 'connected';

  return (
    <div className="app">
      {/* ── Top Bar / Header ── */}
      <header className="top-nav">
        <div className="brand">
          <div className="logo">🛡️</div>
          <div>
            <div className="brand-title">Vault Circle</div>
            <div className="brand-subtitle">Private Savings Circle on Midnight</div>
          </div>
        </div>

        <div className="top-actions">
          <div className="badge ok">
            <span className="dot" /> Network: {ACTIVE_NETWORK}
          </div>

          <button
            className={isConnected ? 'danger small' : 'primary small'}
            onClick={isConnected ? wallet.disconnect : wallet.connect}
            disabled={wallet.status === 'connecting'}
          >
            {wallet.status === 'connecting'
              ? 'Connecting…'
              : isConnected
                ? 'Disconnect'
                : 'Connect Wallet'}
          </button>
        </div>
      </header>

      {/* ── Hero Stats Grid ── */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">
            <span>Pool Balance</span>
            <span>💰</span>
          </div>
          <div className="stat-value">
            {ledger.ledger ? `${ledger.ledger.poolTotal.toString()} tNIGHT` : '0 tNIGHT'}
          </div>
          <div className="stat-subtitle">Shared savings pool</div>
        </div>

        <div className="stat-card">
          <div className="stat-title">
            <span>Required Share</span>
            <span>🎯</span>
          </div>
          <div className="stat-value">
            {ledger.ledger ? `${ledger.ledger.requiredShare.toString()} tNIGHT` : '100 tNIGHT'}
          </div>
          <div className="stat-subtitle">Fixed deposit per cycle</div>
        </div>

        <div className="stat-card">
          <div className="stat-title">
            <span>Total Deposits</span>
            <span>📥</span>
          </div>
          <div className="stat-value">
            {ledger.ledger ? ledger.ledger.contributionsCount.toString() : '0'}
          </div>
          <div className="stat-subtitle">Verified contributions</div>
        </div>

        <div className="stat-card">
          <div className="stat-title">
            <span>Privacy Status</span>
            <span>🔐</span>
          </div>
          <div className="stat-value" style={{ fontSize: 20, color: 'var(--ok)' }}>
            Zero-Knowledge
          </div>
          <div className="stat-subtitle">Amounts encrypted client-side</div>
        </div>
      </section>

      {/* ── Main Work Area ── */}
      <div className="main-grid">
        <ContributePanel wallet={wallet} call={call} ledger={ledger} />
        <LedgerPanel ledger={ledger} />
      </div>

      {/* ── Wallet Details Drawer ── */}
      <div style={{ marginBottom: 28 }}>
        <WalletPanel wallet={wallet} />
      </div>

      {/* ── Privacy Interactive Simulator ── */}
      <PrivacyDemo />

      <footer>
        <span className="grad">Vault Circle</span> · Private Decentralized Finance on Midnight · Powered by Zero-Knowledge Proofs
      </footer>
    </div>
  );
}
