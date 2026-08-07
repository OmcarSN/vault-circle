import { Link } from 'react-router-dom';
import { useGlobalState } from '../context/GlobalStateContext';
import { Section } from '../components/Section';
import { ArrowRightIcon, EyeIcon, LockIcon, ShieldIcon } from '../components/Icons';

const STEPS = [
  {
    step: '01',
    title: 'Connect your wallet',
    desc: 'Link your Midnight Lace wallet. The connector never exposes private witness data to the page.',
    link: '/wallet',
    label: 'Open wallet diagnostics',
  },
  {
    step: '02',
    title: 'Choose a circle',
    desc: 'Review member count, required share, cycle, and solvency before participating.',
    link: '/circles',
    label: 'Browse circles',
  },
  {
    step: '03',
    title: 'Deposit privately',
    desc: 'Generate a proof that your contribution meets the threshold without disclosing the amount.',
    link: '/circles/demo-community-fund/deposit',
    label: 'Try a demonstration',
  },
  {
    step: '04',
    title: 'Claim by rotation',
    desc: 'When your turn arrives, claim the solvent pool and advance the cycle on-chain.',
    link: '/circles/demo-community-fund/payout',
    label: 'Preview payout flow',
  },
];

export function LandingPage() {
  const { wallet } = useGlobalState();
  const isConnected = wallet.status === 'connected';

  return (
    <div className="page-container">
      <section className="hero">
        <div>
          <p className="eyebrow" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--accent-blue)', fontWeight: 600, margin: '0 0 14px' }}>
            Private rotating savings on Midnight
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 46, lineHeight: 1.08, letterSpacing: '-.02em', margin: 0, maxWidth: '13ch' }}>
            Vault Circle
          </h1>
          <p style={{ fontSize: 18, color: 'var(--text-2)', maxWidth: '560px', margin: '18px 0 28px', lineHeight: 1.6 }}>
            Pool funds with your community and prove each required share was met without exposing individual contribution amounts.
          </p>
          <div className="row" style={{ marginBottom: 18 }}>
            {isConnected ? (
              <Link to="/circles"><button className="primary">Browse Circles</button></Link>
            ) : (
              <button className="primary" onClick={wallet.connect} disabled={wallet.status === 'connecting'}>
                {wallet.status === 'connecting' ? 'Connecting…' : 'Connect Wallet'}
              </button>
            )}
            <Link to="/about"><button className="ghost">How privacy works</button></Link>
          </div>
          <div className="privacy-legend">
            <span><ShieldIcon /> Proofs generated on your device</span>
            <span><LockIcon /> Exact amounts stay private</span>
          </div>
        </div>

        <div className="panel" aria-label="Public and private data model">
          <div className="row spread" style={{ marginBottom: 20 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>Circle privacy model</div>
              <div className="small muted">What the network can verify</div>
            </div>
            <span className="badge ok"><span className="dot" /> Solvent</span>
          </div>
          <div className="grid-2">
            <div className="secret-strip">
              <div className="row" style={{ color: 'var(--text-2)', fontWeight: 600, fontSize: 12, marginBottom: 14 }}><LockIcon /> PRIVATE WITNESS</div>
              <div className="kv" style={{ gridTemplateColumns: '1fr auto', gap: 10 }}>
                <span className="k">memberContribution</span><span className="mono">••••••</span>
                <span className="k">memberIndex</span><span className="mono">••</span>
              </div>
            </div>
            <div className="chain-strip">
              <div className="row" style={{ color: 'var(--ok)', fontWeight: 600, fontSize: 12, marginBottom: 14 }}><EyeIcon /> PUBLIC LEDGER</div>
              <div className="kv" style={{ gridTemplateColumns: '1fr auto', gap: 10 }}>
                <span className="k">requiredShare</span><span className="mono">100</span>
                <span className="k">poolSolvent</span><span className="mono">true</span>
              </div>
            </div>
          </div>
          <div className="notice" style={{ marginTop: 16 }}>
            Proof output: <code>contribution ≥ requiredShare</code> · exact value omitted
          </div>
        </div>
      </section>

      <Section title="How it works" subtitle="A four-step cycle with private inputs and publicly auditable rules.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          {STEPS.map((item) => (
            <div key={item.step} style={{ borderTop: '1px solid var(--border-strong)', paddingTop: 16, display: 'flex', flexDirection: 'column', minHeight: 190 }}>
              <span className="mono small" style={{ color: 'var(--accent-blue)', marginBottom: 14 }}>{item.step}</span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, margin: '0 0 8px' }}>{item.title}</h3>
              <p style={{ margin: 0, color: 'var(--text-2)', fontSize: 13.5, lineHeight: 1.55, flex: 1 }}>{item.desc}</p>
              <Link to={item.link} style={{ fontSize: 12.5, fontWeight: 600, marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                {item.label} <ArrowRightIcon size={12} />
              </Link>
            </div>
          ))}
        </div>
      </Section>

      <div className="grid-2">
        <Section title="Private by construction">
          <div className="privacy-legend" style={{ flexDirection: 'column', gap: 12 }}>
            <span><LockIcon /> Exact contribution amounts</span>
            <span><LockIcon /> Individual payout history</span>
            <span><LockIcon /> Wallet-to-position mapping</span>
          </div>
        </Section>
        <Section title="Publicly verifiable">
          <div className="privacy-legend" style={{ flexDirection: 'column', gap: 12 }}>
            <span><EyeIcon /> Pool solvency state</span>
            <span><EyeIcon /> Rotation and cycle progress</span>
            <span><EyeIcon /> Contribution threshold result</span>
          </div>
        </Section>
      </div>

      <Section title="Built for privacy-preserving finance">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20 }}>
          {[
            ['Midnight Network', 'Privacy-first blockchain'],
            ['Compact', 'Zero-knowledge circuits'],
            ['Lace Wallet', 'Midnight wallet connector'],
            ['React + TypeScript', 'Typed application interface'],
          ].map(([label, desc]) => (
            <div key={label}>
              <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 4 }}>{label}</div>
              <div className="small muted">{desc}</div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
