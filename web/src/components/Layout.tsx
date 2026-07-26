import { Link, Outlet } from 'react-router-dom';
import { useGlobalState } from '../context/GlobalStateContext';

export function Layout() {
  const { wallet, connectedNetwork, activeCircleId } = useGlobalState();
  const isConnected = wallet.status === 'connected';

  return (
    <div className="app">
      {/* ── Top Bar / Header ── */}
      <header className="top-nav">
        <Link to="/" className="brand" style={{ textDecoration: 'none' }}>
          <div className="logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4L12 20L20 4H15.5L12 11.5L8.5 4H4Z" fill="white" />
              <path d="M12 20L15.5 11.5L20 4L12 20Z" fill="rgba(255, 255, 255, 0.4)" />
            </svg>
          </div>
          <div>
            <div className="brand-title">Vault Circle</div>
            <div className="brand-subtitle">Private Savings Circle on Midnight</div>
          </div>
        </Link>

        {/* ── Navigation Links ── */}
        <nav style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link to="/circles">Circles</Link>
          <Link to="/wallet">Wallet</Link>
          <Link to="/privacy-lab">Privacy Lab</Link>
          <Link to="/about">About</Link>
          {activeCircleId && (
            <Link to={`/circles/${activeCircleId}`} style={{ color: 'var(--ok)' }}>
              Active: {activeCircleId}
            </Link>
          )}
        </nav>

        <div className="top-actions">
          <div className="badge ok">
            <span className="dot" /> {connectedNetwork}
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

      {/* ── Main Work Area ── */}
      <main className="main-content" style={{ padding: '24px' }}>
        <Outlet />
      </main>

      <footer style={{ marginTop: 'auto', textAlign: 'center', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <span className="grad">Vault Circle</span> · Private Decentralized Finance on Midnight · Powered by Zero-Knowledge Proofs
        </div>
        <div>
          <a href="https://github.com/OmcarSN/vault-circle" target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
            📂 GitHub Repository
          </a>
        </div>
      </footer>
    </div>
  );
}
