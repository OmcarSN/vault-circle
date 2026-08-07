import { Link, Outlet, useLocation } from 'react-router-dom';
import { useGlobalState } from '../context/GlobalStateContext';
import { GitHubIcon } from './Icons';

const NAV_ITEMS = [
  {
    to: '/',
    label: 'Home',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
    ),
    exact: true,
  },
  {
    to: '/circles',
    label: 'Circles',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
    ),
  },
  {
    to: '/wallet',
    label: 'Wallet',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 10H2M6 16h4"/></svg>
    ),
  },
  {
    to: '/privacy-lab',
    label: 'Privacy Lab',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    ),
  },
  {
    to: '/about',
    label: 'About',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
    ),
  },
];

export function Layout() {
  const { wallet, connectedNetwork, activeCircleId } = useGlobalState();
  const isConnected = wallet.status === 'connected';
  const location = useLocation();

  const isActive = (to: string, exact?: boolean) => {
    if (exact) return location.pathname === to;
    return location.pathname === to || location.pathname.startsWith(to + '/');
  };

  return (
    <div className="app">
      {/* ── Top Bar / Header ── */}
      <header className="top-nav">
        <Link to="/" className="brand" style={{ textDecoration: 'none' }}>
          <div className="logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.4))' }}>
              <path fillRule="evenodd" clipRule="evenodd" d="M2.25 4C2.25 3.3 2.95 2.8 3.6 3.1L12 7.2L20.4 3.1C21.05 2.8 21.75 3.3 21.75 4V6.5C21.75 6.9 21.5 7.25 21.15 7.4L12 11.75L2.85 7.4C2.5 7.25 2.25 6.9 2.25 6.5V4ZM12 21.25L2.5 12.5V9.5L12 14L21.5 9.5V12.5L12 21.25Z" fill="#FFFFFF" />
              <path d="M12 21.25L2.5 12.5V9.5L12 14L21.5 9.5V12.5L12 21.25Z" fill="#E0E7FF" />
            </svg>
          </div>
          <div>
            <div className="brand-title">Vault Circle</div>
            <div className="brand-subtitle">Private Savings Circle on Midnight</div>
          </div>
        </Link>

        {/* ── Navigation Links ── */}
        <nav className="nav-links">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`nav-link ${isActive(item.to, item.exact) ? 'nav-link--current' : ''}`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
          {activeCircleId && (
            <Link
              to={`/circles/${activeCircleId}`}
              className={`nav-link nav-link--active ${isActive(`/circles/${activeCircleId}`) ? 'nav-link--current' : ''}`}
            >
              <span className="dot" style={{ width: 6, height: 6 }} />
              Active Circle
            </Link>
          )}
        </nav>

        <div className="top-actions">
          <div className={`badge ${isConnected ? 'ok' : 'off'}`}>
            <span className="dot" /> {isConnected ? connectedNetwork : 'Wallet disconnected'}
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

      {wallet.error && (
        <div style={{ padding: '0 24px', marginTop: '16px' }}>
          <div className="notice err" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>Connection Error:</strong> {wallet.error}
            </div>
            {wallet.error.includes('install it from lace.io') && (
              <a href="https://www.lace.io" target="_blank" rel="noreferrer" className="badge ok" style={{ textDecoration: 'none' }}>
                Get Lace Wallet
              </a>
            )}
          </div>
        </div>
      )}

      {/* ── Main Work Area ── */}
      <main className="main-content" style={{ padding: '24px' }}>
        <Outlet />
      </main>

      <footer style={{ marginTop: 'auto', textAlign: 'center', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <span className="grad">Vault Circle</span> · Private Decentralized Finance on Midnight · Powered by Zero-Knowledge Proofs
        </div>
        <div>
          <a href="https://github.com/OmcarSN/vault-circle" target="_blank" rel="noreferrer" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
            <GitHubIcon size={15} /> GitHub Repository
          </a>
        </div>
      </footer>
    </div>
  );
}
