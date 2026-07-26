// No imports needed

export function About() {
  return (
    <div className="page-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>About Vault Circle</h1>
          <p style={{ opacity: 0.8 }}>Privacy-preserving ROSCA (Rotating Savings Circle) built on the Midnight Network.</p>
        </div>
      </div>

      {/* ── Privacy Claim ── */}
      <section className="panel" style={{ marginBottom: '24px' }}>
        <h2>The Privacy Claim</h2>
        <p>
          Vault Circle leverages zero-knowledge cryptography to fix the fundamental flaw in traditional on-chain finance: 
          <strong> total transparency.</strong> We ensure financial privacy for individuals while guaranteeing systemic trust for the group.
        </p>

        <div className="main-grid" style={{ marginTop: '24px' }}>
          <div style={{ background: 'rgba(31,81,54,0.05)', border: '1px solid var(--ok)', padding: '16px', borderRadius: '8px' }}>
            <h3 style={{ color: 'var(--ok)', marginTop: 0 }}>🔒 What stays strictly Private</h3>
            <ul style={{ margin: 0, paddingLeft: '20px', opacity: 0.9 }}>
              <li style={{ marginBottom: '8px' }}><strong>Exact Contribution Amounts:</strong> Never recorded on the ledger. Your exact capital limits and deposit sizes are encrypted on your local device.</li>
              <li style={{ marginBottom: '8px' }}><strong>Individual Payout History:</strong> Other members cannot inspect the chain to see exactly when you claimed a payout or how much your specific claim was worth.</li>
              <li><strong>Member Identity Mapping:</strong> The rotation sequence uses masked indexes, decoupling your Lace wallet address from your turn in the circle.</li>
            </ul>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '16px', borderRadius: '8px' }}>
            <h3 style={{ color: 'var(--text-muted)', marginTop: 0 }}>👁 What is Publicly Provable</h3>
            <ul style={{ margin: 0, paddingLeft: '20px', opacity: 0.9 }}>
              <li style={{ marginBottom: '8px' }}><strong>Pool Solvency:</strong> The contract cryptographically guarantees that the collective pool has met its funding target before allowing payouts.</li>
              <li style={{ marginBottom: '8px' }}><strong>Fair Rotation:</strong> The smart contract enforces strict turn-based claiming, ensuring no member can skip the line or claim twice.</li>
              <li><strong>Threshold Met:</strong> Zero-knowledge proofs publicly verify that each member met the minimum required share, without revealing the actual amount deposited.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── Architecture Diagram ── */}
      <section className="panel" style={{ marginBottom: '24px' }}>
        <h2>System Architecture</h2>
        <p className="sub">How local ZK proofs interact with the Midnight ledger.</p>

        <div style={{ 
          background: 'var(--bg-card)', 
          border: '1px solid var(--border)', 
          borderRadius: '8px', 
          padding: '24px', 
          fontFamily: 'monospace',
          fontSize: '0.9rem',
          lineHeight: '1.5',
          overflowX: 'auto',
          whiteSpace: 'pre'
        }}>
{`[ Client Browser ]                             [ Midnight Network ]
       │                                              │
 ┌─────▼──────┐     Local Witness         ┌───────────▼───────────┐
 │ Lace Wallet│ ───────────────────────►  │ Public Ledger State   │
 └─────┬──────┘  (Private Deposit Amt)    │ - poolSolvent         │
       │                                  │ - poolTotal           │
       │                                  │ - memberCount         │
       │                                  │ - cycleCount          │
 ┌─────▼──────┐                           │ - recipientIndex      │
 │ UI React   │                           └───────────┬───────────┘
 │ Dashboard  │ ◄─────────────────────────────────────┤
 │ Deposit UI │       Read Public State (indexer)     │
 └─────┬──────┘                                       │
       │                                              │
 ┌─────▼──────┐     submitTx(proof)       ┌───────────▼───────────┐
 │ Proof Svr  │ ───────────────────────►  │ Compact Smart Contract│
 │ (Localhost)│                           │ - contribute()        │
 └────────────┘                           │ - claimPayout()       │
    Generates                             │ - checkSolvency()     │
    ZK Proof                              └───────────────────────┘`}
        </div>
      </section>

    </div>
  );
}
