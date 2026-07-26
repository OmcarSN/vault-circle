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
            <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6L16 28L29 6H21.5L16 16.5L10.5 6H3Z" fill="url(#paint0_linear)" />
              <path d="M16 28L21.5 16.5L29 6L16 28Z" fill="url(#paint1_linear)" style={{ mixBlendMode: 'overlay' }} />
              <path d="M16 28L10.5 16.5L16 6L21.5 16.5L16 28Z" fill="url(#paint2_linear)" opacity="0.6" />
              <defs>
                <linearGradient id="paint0_linear" x1="3" y1="6" x2="29" y2="28" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFFFFF" />
                  <stop offset="1" stopColor="#A5B4FC" />
                </linearGradient>
                <linearGradient id="paint1_linear" x1="16" y1="28" x2="29" y2="6" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#818CF8" />
                  <stop offset="1" stopColor="#C7D2FE" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="paint2_linear" x1="16" y1="6" x2="16" y2="28" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#38BDF8" stopOpacity="0.8"/>
                  <stop offset="1" stopColor="#818CF8" stopOpacity="0"/>
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
