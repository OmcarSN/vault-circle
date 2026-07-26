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
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.4))' }}>
              <path fillRule="evenodd" clipRule="evenodd" d="M2.25 4C2.25 3.3 2.95 2.8 3.6 3.1L12 7.2L20.4 3.1C21.05 2.8 21.75 3.3 21.75 4V6.5C21.75 6.9 21.5 7.25 21.15 7.4L12 11.75L2.85 7.4C2.5 7.25 2.25 6.9 2.25 6.5V4ZM12 21.25L2.5 12.5V9.5L12 14L21.5 9.5V12.5L12 21.25Z" fill="#FFFFFF" />
              <path d="M12 21.25L2.5 12.5V9.5L12 14L21.5 9.5V12.5L12 21.25Z" fill="url(#bold_grad)" />
              <defs>
                <linearGradient id="bold_grad" x1="12" y1="9.5" x2="12" y2="21.25" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFFFFF" />
                  <stop offset="1" stopColor="#E0E7FF" />
                </linearGradient>
              </defs>
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
