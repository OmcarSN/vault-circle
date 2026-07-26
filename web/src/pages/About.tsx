// No imports needed

export function About() {
  return (
    <div className="page-container" style={{ maxWidth: '860px', margin: '0 auto' }}>

      {/* ── Header ── */}
      <section style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          marginBottom: '8px',
          background: 'linear-gradient(120deg, #fff 0%, #cdd4ff 55%, #9fe0ff 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        }}>
          About Vault Circle
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>
          A privacy-preserving ROSCA (Rotating Savings &amp; Credit Association) built on the Midnight Network.
          Members pool funds together and take turns receiving the full pot — with ZK proofs ensuring fairness
          without exposing anyone's financial details.
        </p>
      </section>

      {/* ── What is a ROSCA? ── */}
      <section className="panel" style={{ marginBottom: '24px' }}>
        <h2>What is a ROSCA?</h2>
        <p style={{ color: 'var(--muted)', lineHeight: 1.65, margin: '12px 0 0' }}>
          A <strong>Rotating Savings and Credit Association</strong> is one of the oldest financial tools in the world.
          A group of people each contribute a fixed amount every cycle. Each cycle, one member receives the entire
          pooled sum. This continues until everyone has had their turn. It's community-powered lending — no banks,
          no intermediaries.
        </p>
        <p style={{ color: 'var(--muted)', lineHeight: 1.65, margin: '12px 0 0' }}>
          <strong>The problem on-chain:</strong> Traditional blockchains make every transaction public. Everyone can see
          who deposited, how much, and when they got paid out. Vault Circle solves this with zero-knowledge proofs on
          the Midnight Network.
        </p>
      </section>

      {/* ── Privacy Claim ── */}
      <section className="panel" style={{ marginBottom: '24px' }}>
        <h2>The Privacy Guarantee</h2>
        <p style={{ color: 'var(--muted)', lineHeight: 1.6, margin: '12px 0 20px' }}>
          Vault Circle separates what the <em>group needs to verify</em> from what should remain
          <em> strictly personal</em>. Zero-knowledge proofs make this possible.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{
            background: 'rgba(52, 211, 153, 0.06)',
            border: '1px solid rgba(52, 211, 153, 0.25)',
            padding: '20px',
            borderRadius: '12px',
          }}>
            <h3 style={{ color: 'var(--ok)', margin: '0 0 14px', fontSize: '1rem', fontWeight: 700 }}>
              🔒 Stays Private
            </h3>
            <ul style={{ margin: 0, paddingLeft: '18px', lineHeight: 1.8, fontSize: '0.9rem', color: 'var(--muted)' }}>
              <li><strong>Exact contribution amounts</strong> — encrypted locally, never on the ledger</li>
              <li><strong>Individual payout history</strong> — only you know when and how much you claimed</li>
              <li><strong>Identity ↔ rotation mapping</strong> — your wallet address is decoupled from your turn order</li>
            </ul>
          </div>

          <div style={{
            background: 'rgba(76, 141, 255, 0.06)',
            border: '1px solid rgba(76, 141, 255, 0.25)',
            padding: '20px',
            borderRadius: '12px',
          }}>
            <h3 style={{ color: 'var(--accent-blue)', margin: '0 0 14px', fontSize: '1rem', fontWeight: 700 }}>
              👁 Publicly Verifiable
            </h3>
            <ul style={{ margin: 0, paddingLeft: '18px', lineHeight: 1.8, fontSize: '0.9rem', color: 'var(--muted)' }}>
              <li><strong>Pool solvency</strong> — cryptographic guarantee the pool is fully funded before payouts</li>
              <li><strong>Fair rotation</strong> — on-chain enforcement that no one can skip the line or claim twice</li>
              <li><strong>Threshold met</strong> — ZK proof that each member met the minimum share (yes/no only)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── Architecture ── */}
      <section className="panel" style={{ marginBottom: '24px' }}>
        <h2>System Architecture</h2>
        <p className="sub" style={{ marginBottom: '24px' }}>How your browser, the ZK proof engine, and the Midnight ledger work together.</p>

        {/* Visual flow diagram */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Row 1: Client side */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: '16px',
            alignItems: 'center',
          }}>
            <div style={{
              background: 'var(--panel-2)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '16px 20px',
              textAlign: 'center',
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>🔐 Lace Wallet</div>
              <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Signs transactions, holds keys</div>
            </div>

            <div style={{
              color: 'var(--accent)',
              fontWeight: 700,
              fontSize: '1.4rem',
              textAlign: 'center',
            }}>⟷</div>

            <div style={{
              background: 'var(--panel-2)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '16px 20px',
              textAlign: 'center',
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>🖥️ React Frontend</div>
              <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Dashboard, Deposit, Payout UI</div>
            </div>
          </div>

          {/* Arrow down */}
          <div style={{
            textAlign: 'center',
            background: 'var(--grad)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            fontWeight: 800,
            fontSize: '1.2rem',
          }}>▼ ZK Proof (private witness) ▼</div>

          {/* Row 2: Proof + Contract */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: '16px',
            alignItems: 'center',
          }}>
            <div style={{
              background: 'rgba(139, 108, 255, 0.08)',
              border: '1px solid rgba(139, 108, 255, 0.3)',
              borderRadius: '12px',
              padding: '16px 20px',
              textAlign: 'center',
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>⚡ Proof Server</div>
              <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Generates ZK proof locally</div>
            </div>

            <div style={{
              color: 'var(--ok)',
              fontWeight: 700,
              fontSize: '1.4rem',
              textAlign: 'center',
            }}>→</div>

            <div style={{
              background: 'rgba(52, 211, 153, 0.08)',
              border: '1px solid rgba(52, 211, 153, 0.3)',
              borderRadius: '12px',
              padding: '16px 20px',
              textAlign: 'center',
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>📜 Compact Contract</div>
              <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>contribute(), claimPayout(), checkSolvency()</div>
            </div>
          </div>

          {/* Arrow down */}
          <div style={{
            textAlign: 'center',
            background: 'var(--grad)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            fontWeight: 800,
            fontSize: '1.2rem',
          }}>▼ Public State (on-chain) ▼</div>

          {/* Row 3: Ledger */}
          <div style={{
            background: 'rgba(52, 211, 153, 0.05)',
            border: '1px solid rgba(52, 211, 153, 0.2)',
            borderRadius: '12px',
            padding: '20px 24px',
            textAlign: 'center',
          }}>
            <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '8px' }}>Midnight Public Ledger</div>
            <div style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              color: 'var(--muted)',
              fontSize: '0.85rem',
            }}>
              {['poolSolvent', 'poolTotal', 'memberCount', 'cycleCount', 'recipientIndex'].map((field) => (
                <code key={field} style={{ fontSize: '0.82rem' }}>{field}</code>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Built With ── */}
      <section className="panel" style={{ marginBottom: '24px' }}>
        <h2>Built With</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '14px',
          marginTop: '16px',
        }}>
          {[
            { name: 'Midnight Network', role: 'Privacy L1 blockchain' },
            { name: 'Compact', role: 'ZK circuit language' },
            { name: 'Midnight.js SDK', role: 'Contract interaction' },
            { name: 'Lace Wallet', role: 'DApp connector' },
            { name: 'React + TypeScript', role: 'Frontend framework' },
            { name: 'Vite', role: 'Build tooling' },
          ].map((t) => (
            <div key={t.name} style={{
              background: 'var(--panel-2)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '14px 16px',
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t.name}</div>
              <div style={{ color: 'var(--muted)', fontSize: '0.8rem', marginTop: '2px' }}>{t.role}</div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
