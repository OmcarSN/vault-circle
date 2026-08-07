import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Section } from '../components/Section';
import { ArrowRightIcon, EyeIcon, LockIcon } from '../components/Icons';

// One node in the architecture flow.
function Node({ title, desc, tone = 'neutral' }: { title: string; desc: string; tone?: 'neutral' | 'accent' | 'ok' }) {
  const border =
    tone === 'accent' ? 'rgba(79,107,237,.35)' : tone === 'ok' ? 'rgba(47,182,124,.35)' : 'var(--border)';
  return (
    <div style={{ background: 'var(--surface-2)', border: `1px solid ${border}`, borderRadius: 8, padding: '16px 18px' }}>
      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{title}</div>
      <div className="small muted">{desc}</div>
    </div>
  );
}

function FlowLabel({ children }: { children: string }) {
  return (
    <div className="mono small" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--muted)', padding: '4px 0' }}>
      <svg width="12" height="14" viewBox="0 0 12 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="6" y1="1" x2="6" y2="12" />
        <polyline points="2 8 6 12 10 8" />
      </svg>
      {children}
    </div>
  );
}

export function About() {
  return (
    <div className="page-container page-container--narrow">
      <PageHeader
        eyebrow="About"
        title="About Vault Circle"
        subtitle="A privacy-preserving ROSCA (Rotating Savings & Credit Association) on the Midnight Network. Members pool funds and take turns receiving the pot, with zero-knowledge proofs enforcing fairness without exposing anyone's financial details."
      />

      <Section title="What is a ROSCA?">
        <p style={{ color: 'var(--text-2)', lineHeight: 1.65, margin: 0 }}>
          A <strong>Rotating Savings and Credit Association</strong> is one of the oldest financial tools
          in the world. A group each contributes a fixed amount every cycle, and each cycle one member
          receives the entire pooled sum — continuing until everyone has had a turn. It is
          community-powered lending with no bank in the middle.
        </p>
        <p style={{ color: 'var(--text-2)', lineHeight: 1.65, margin: '14px 0 0' }}>
          <strong>The problem on-chain:</strong> most blockchains make every transaction public — who
          deposited, how much, and when they were paid. Vault Circle closes that gap with
          zero-knowledge proofs on Midnight.
        </p>
      </Section>

      <Section title="The privacy guarantee" subtitle="Separating what the group must verify from what stays strictly personal.">
        <div className="grid-2">
          <div className="chain-strip" style={{ borderColor: 'rgba(47,182,124,.25)' }}>
            <h3 style={{ color: 'var(--ok)', margin: '0 0 14px', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <LockIcon /> Stays private
            </h3>
            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8, fontSize: 13, color: 'var(--text-2)' }}>
              <li><strong>Exact contribution amounts</strong> — encrypted locally, never on the ledger</li>
              <li><strong>Individual payout history</strong> — only you know when and how much you claimed</li>
              <li><strong>Identity-to-rotation mapping</strong> — your address is decoupled from turn order</li>
            </ul>
          </div>
          <div className="secret-strip" style={{ borderStyle: 'solid', borderColor: 'rgba(79,107,237,.25)' }}>
            <h3 style={{ color: 'var(--accent-blue)', margin: '0 0 14px', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <EyeIcon /> Publicly verifiable
            </h3>
            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8, fontSize: 13, color: 'var(--text-2)' }}>
              <li><strong>Pool solvency</strong> — a guarantee the pool is fully funded before payouts</li>
              <li><strong>Fair rotation</strong> — on-chain enforcement that no one skips the line or claims twice</li>
              <li><strong>Threshold met</strong> — a proof that each member met the minimum share (yes/no only)</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section title="System architecture" subtitle="How your browser, the ZK proof engine, and the Midnight ledger work together.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="grid-2">
            <Node title="Lace Wallet" desc="Signs transactions, holds keys" />
            <Node title="React Frontend" desc="Dashboard, deposit, payout UI" />
          </div>
          <FlowLabel>ZK proof over private witness</FlowLabel>
          <div className="grid-2">
            <Node title="Proof Server" desc="Generates the ZK proof locally" tone="accent" />
            <Node title="Compact Contract" desc="contribute(), claimPayout(), checkSolvency()" tone="accent" />
          </div>
          <FlowLabel>Public state committed on-chain</FlowLabel>
          <div style={{ background: 'rgba(47,182,124,.05)', border: '1px solid rgba(47,182,124,.2)', borderRadius: 8, padding: '18px 20px', textAlign: 'center' }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>Midnight Public Ledger</div>
            <div className="row" style={{ justifyContent: 'center', gap: 8 }}>
              {['poolSolvent', 'poolTotal', 'memberCount', 'cycleCount', 'recipientIndex'].map((field) => (
                <code key={field}>{field}</code>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section title="Built with">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14 }}>
          {[
            ['Midnight Network', 'Privacy L1 blockchain'],
            ['Compact', 'ZK circuit language'],
            ['Midnight.js SDK', 'Contract interaction'],
            ['Lace Wallet', 'DApp connector'],
            ['React + TypeScript', 'Frontend framework'],
            ['Vite', 'Build tooling'],
          ].map(([name, role]) => (
            <div key={name} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 16px' }}>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>{name}</div>
              <div className="small muted" style={{ marginTop: 2 }}>{role}</div>
            </div>
          ))}
        </div>
      </Section>

      <div className="row spread" style={{ marginTop: 8 }}>
        <span className="small muted">Ready to see it in action?</span>
        <Link to="/circles">
          <button className="primary">Browse Circles <ArrowRightIcon size={13} style={{ marginLeft: 2, verticalAlign: '-2px' }} /></button>
        </Link>
      </div>
    </div>
  );
}
