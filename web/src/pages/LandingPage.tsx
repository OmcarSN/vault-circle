import { Link } from 'react-router-dom';
import { useGlobalState } from '../context/GlobalStateContext';

export function LandingPage() {
  const { wallet } = useGlobalState();
  const isConnected = wallet.status === 'connected';

  return (
    <div className="page-container" style={{ maxWidth: '900px', margin: '0 auto' }}>

      {/* ── Hero ── */}
      <section style={{ textAlign: 'center', padding: '40px 0 48px' }}>
        <h1 style={{
          fontSize: '2.8rem',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
          marginBottom: '16px',
          background: 'linear-gradient(120deg, #fff 0%, #cdd4ff 55%, #9fe0ff 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        }}>
          Private Savings Circles,<br />Powered by Zero-Knowledge Proofs
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--muted)', maxWidth: '600px', margin: '0 auto 32px', lineHeight: 1.6 }}>
          Pool funds with your community. Prove you contributed — without revealing how much.
          Built on the <strong style={{ color: '#A5B4FC' }}>Midnight Network</strong>.
        </p>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {isConnected ? (
            <Link to="/circles">
              <button className="primary" style={{ fontSize: '1rem', padding: '14px 32px' }}>
                Browse Circles
              </button>
            </Link>
          ) : (
            <button
              className="primary"
              style={{ fontSize: '1rem', padding: '14px 32px' }}
              onClick={wallet.connect}
              disabled={wallet.status === 'connecting'}
            >
              {wallet.status === 'connecting' ? 'Connecting…' : 'Connect Wallet to Start'}
            </button>
          )}
          <Link to="/about">
            <button className="ghost" style={{ fontSize: '1rem', padding: '14px 32px' }}>
              Learn How It Works
            </button>
          </Link>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '32px', fontSize: '1.5rem', fontWeight: 700 }}>
          How It Works
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          {[
            {
              step: '01',
              title: 'Connect Your Wallet',
              desc: 'Link your Midnight Lace wallet. Your identity stays private — only you see your address.',
              link: '/wallet',
              linkLabel: 'Go to Wallet →',
            },
            {
              step: '02',
              title: 'Join a Circle',
              desc: 'Browse active savings circles. See public metadata like member count and solvency — never private balances.',
              link: '/circles',
              linkLabel: 'Browse Circles →',
            },
            {
              step: '03',
              title: 'Deposit Privately',
              desc: 'Contribute your share. A ZK proof verifies you met the threshold without revealing your exact amount.',
              link: null,
              linkLabel: '',
            },
            {
              step: '04',
              title: 'Claim Your Payout',
              desc: 'When rotation reaches your turn, claim the pooled funds. Fair order is enforced on-chain.',
              link: null,
              linkLabel: '',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="panel"
              style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'var(--grad)', display: 'grid', placeItems: 'center',
                fontSize: '14px', fontWeight: 800, color: '#fff',
                boxShadow: '0 6px 20px -6px rgba(124, 108, 255, 0.6)',
              }}>
                {item.step}
              </div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>{item.title}</h3>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.55, flex: 1 }}>
                {item.desc}
              </p>
              {item.link && (
                <Link to={item.link} style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  {item.linkLabel}
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Privacy at a Glance ── */}
      <section style={{ marginBottom: '40px' }}>
        <div className="panel" style={{ padding: '32px' }}>
          <h2 style={{ marginBottom: '20px', fontSize: '1.3rem', fontWeight: 700 }}>Privacy at a Glance</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <h4 style={{ color: 'var(--ok)', margin: '0 0 12px', fontSize: '0.95rem', fontWeight: 700 }}>
                🔒 Private to You
              </h4>
              <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                <li>Exact deposit amounts</li>
                <li>Individual payout history</li>
                <li>Wallet ↔ rotation position mapping</li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: 'var(--accent-blue)', margin: '0 0 12px', fontSize: '0.95rem', fontWeight: 700 }}>
                👁 Publicly Provable
              </h4>
              <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                <li>Pool solvency status</li>
                <li>Fair rotation enforcement</li>
                <li>Contribution threshold met (yes/no)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section style={{ marginBottom: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {[
            { label: 'Midnight Network', desc: 'Privacy-first L1 blockchain' },
            { label: 'Compact Language', desc: 'ZK smart contract circuits' },
            { label: 'Lace Wallet', desc: 'Browser extension connector' },
            { label: 'React + TypeScript', desc: 'Modern DApp frontend' },
          ].map((tech) => (
            <div
              key={tech.label}
              style={{
                background: 'var(--panel)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '18px 20px',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>{tech.label}</div>
              <div style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>{tech.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
