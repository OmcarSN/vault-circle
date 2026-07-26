import { Link, Outlet } from 'react-router-dom';
import { useGlobalState } from '../context/GlobalStateContext';

export function Layout() {
  const { walletStatus, setWalletStatus, connectedNetwork, activeCircleId } = useGlobalState();
  const isConnected = walletStatus === 'connected';

  const toggleWallet = () => {
    if (isConnected) {
      setWalletStatus('disconnected');
    } else {
      setWalletStatus('connecting');
      // Simulate connection delay for UI testing
      setTimeout(() => setWalletStatus('connected'), 1000);
    }
  };

  return (
    <div className="app">
      {/* ── Top Bar / Header ── */}
      <header className="top-nav">
        <Link to="/" className="brand" style={{ textDecoration: 'none' }}>
          <div className="logo">🛡️</div>
          <div>
            <div className="brand-title">Vault Circle</div>
            <div className="brand-subtitle">Private Savings Circle on Midnight</div>
          </div>
        </Link>

        {/* ── Navigation Links ── */}
        <nav style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link to="/circles">Circles</Link>
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
            onClick={toggleWallet}
            disabled={walletStatus === 'connecting'}
          >
            {walletStatus === 'connecting'
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

      <footer style={{ marginTop: 'auto', textAlign: 'center', padding: '24px' }}>
        <span className="grad">Vault Circle</span> · Private Decentralized Finance on Midnight · Powered by Zero-Knowledge Proofs
      </footer>
    </div>
  );
}
