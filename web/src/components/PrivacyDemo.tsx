import { useMemo, useState } from 'react';
import {
  modelContribute,
  disclosedFingerprint,
  inferredRange,
  type PublicStateBefore,
} from '../privacy/model';

export function PrivacyDemo() {
  const [requiredShare, setRequiredShare] = useState('100');
  const [amountA, setAmountA] = useState('100'); // Alice
  const [amountB, setAmountB] = useState('100000'); // Bob

  const share = safeBig(requiredShare);
  const a = safeBig(amountA);
  const b = safeBig(amountB);

  const before: PublicStateBefore = useMemo(
    () => ({ requiredShare: share, contributionsCount: 0n, poolTotal: 0n }),
    [share],
  );

  const outA = useMemo(() => modelContribute({ amount: a }, before), [a, before]);
  const outB = useMemo(() => modelContribute({ amount: b }, before), [b, before]);

  const fpA = disclosedFingerprint(outA.disclosed);
  const fpB = disclosedFingerprint(outB.disclosed);
  const identical = fpA === fpB;
  const bothMet = outA.returned && outB.returned;

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto' }}>

      {/* ── Hero Header ── */}
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
          Privacy Lab
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>
          See zero-knowledge proofs in action. Two people deposit <strong style={{ color: '#fff' }}>completely different amounts</strong>,
          but the blockchain only records <strong style={{ color: '#fff' }}>the same proof</strong> for both.
          Try it yourself below.
        </p>
      </section>

      {/* ── Step 1: Set the Rule ── */}
      <section className="panel" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <span style={{
            width: '28px', height: '28px', borderRadius: '8px',
            background: 'var(--grad)', display: 'grid', placeItems: 'center',
            fontSize: '13px', fontWeight: 800, color: '#fff', flexShrink: 0,
          }}>1</span>
          <h2 style={{ margin: 0 }}>Set the Minimum Share</h2>
        </div>
        <p className="sub" style={{ margin: '0 0 16px' }}>
          This is the minimum amount each member must deposit per cycle. The contract only checks: <em>"Did they meet this threshold?"</em> — not the exact amount.
        </p>
        <div style={{ maxWidth: '280px' }}>
          <label className="small muted" style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>
            Required Share (tNIGHT)
          </label>
          <input
            type="number"
            min="0"
            value={requiredShare}
            onChange={(e) => setRequiredShare(e.target.value)}
          />
        </div>
      </section>

      {/* ── Step 2: Two Deposits ── */}
      <section className="panel" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <span style={{
            width: '28px', height: '28px', borderRadius: '8px',
            background: 'var(--grad)', display: 'grid', placeItems: 'center',
            fontSize: '13px', fontWeight: 800, color: '#fff', flexShrink: 0,
          }}>2</span>
          <h2 style={{ margin: 0 }}>Make Two Secret Deposits</h2>
        </div>
        <p className="sub" style={{ margin: '0 0 20px' }}>
          Enter different amounts for Alice and Bob. These values are <strong>private</strong> — they never leave your device. Only the ZK proof result goes on-chain.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Alice */}
          <div className="secret-strip">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{
                width: '24px', height: '24px', borderRadius: '50%',
                background: '#818CF8', display: 'grid', placeItems: 'center',
                fontSize: '12px', fontWeight: 800, color: '#fff',
              }}>A</span>
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Alice</span>
              <span className="small muted">🔒 Secret</span>
            </div>
            <input
              type="number"
              min="0"
              value={amountA}
              onChange={(e) => setAmountA(e.target.value)}
              placeholder="e.g. 100"
            />
          </div>

          {/* Bob */}
          <div className="secret-strip">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{
                width: '24px', height: '24px', borderRadius: '50%',
                background: '#38BDF8', display: 'grid', placeItems: 'center',
                fontSize: '12px', fontWeight: 800, color: '#fff',
              }}>B</span>
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Bob</span>
              <span className="small muted">🔒 Secret</span>
            </div>
            <input
              type="number"
              min="0"
              value={amountB}
              onChange={(e) => setAmountB(e.target.value)}
              placeholder="e.g. 100000"
            />
          </div>
        </div>
      </section>

      {/* ── Circuit Divider ── */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
        <div style={{
          padding: '4px 14px', background: 'rgba(139, 108, 255, 0.1)',
          border: '1px solid var(--border-strong)', borderRadius: '20px',
          fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
          letterSpacing: '0.08em', color: 'var(--accent-blue)',
        }}>
          ZK Circuit Transformation
        </div>
      </div>

      {/* ── Step 3: What the Blockchain Sees ── */}
      <section className="panel" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <span style={{
            width: '28px', height: '28px', borderRadius: '8px',
            background: 'var(--grad)', display: 'grid', placeItems: 'center',
            fontSize: '13px', fontWeight: 800, color: '#fff', flexShrink: 0,
          }}>3</span>
          <h2 style={{ margin: 0 }}>What the Blockchain Sees</h2>
        </div>
        <p className="sub" style={{ margin: '0 0 20px' }}>
          This is <strong>all</strong> the information that goes on-chain. Notice: no deposit amounts, no identity info — just a yes/no proof.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Alice's public record */}
          <div className="chain-strip">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{
                width: '24px', height: '24px', borderRadius: '50%',
                background: '#818CF8', display: 'grid', placeItems: 'center',
                fontSize: '12px', fontWeight: 800, color: '#fff',
              }}>A</span>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Alice's Public Record</span>
              <span className="small muted">👁 On-Chain</span>
            </div>
            <div className="kv small">
              <div className="k">Share Met?</div>
              <div>
                <span className={`badge ${outA.returned ? 'ok' : 'err'}`}>
                  <span className="dot" />
                  {outA.returned ? 'Yes ✓' : 'No ✗'}
                </span>
              </div>
              <div className="k">Deposit Amount</div>
              <div>
                <span style={{
                  display: 'inline-block',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px dashed rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  color: 'var(--muted)',
                  letterSpacing: '0.1em',
                }}>
                  [ ENCRYPTED ]
                </span>
              </div>
            </div>
          </div>

          {/* Bob's public record */}
          <div className="chain-strip">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{
                width: '24px', height: '24px', borderRadius: '50%',
                background: '#38BDF8', display: 'grid', placeItems: 'center',
                fontSize: '12px', fontWeight: 800, color: '#fff',
              }}>B</span>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Bob's Public Record</span>
              <span className="small muted">👁 On-Chain</span>
            </div>
            <div className="kv small">
              <div className="k">Share Met?</div>
              <div>
                <span className={`badge ${outB.returned ? 'ok' : 'err'}`}>
                  <span className="dot" />
                  {outB.returned ? 'Yes ✓' : 'No ✗'}
                </span>
              </div>
              <div className="k">Deposit Amount</div>
              <div>
                <span style={{
                  display: 'inline-block',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px dashed rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  color: 'var(--muted)',
                  letterSpacing: '0.1em',
                }}>
                  [ ENCRYPTED ]
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── The Verdict ── */}
      <section
        className={`panel ${identical && bothMet ? '' : ''}`}
        style={{
          marginBottom: '20px',
          borderColor: identical && bothMet ? 'rgba(52, 211, 153, 0.4)' : 'rgba(251, 191, 36, 0.4)',
          background: identical && bothMet ? 'rgba(52, 211, 153, 0.06)' : 'rgba(251, 191, 36, 0.06)',
        }}
      >
        {identical && bothMet ? (
          <>
            <h2 style={{ color: 'var(--ok)', margin: '0 0 12px', fontSize: '1.25rem' }}>State Match: Identical Public Footprint</h2>
            <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.65 }}>
              Despite differing deposit inputs ({a.toString()} vs {b.toString()}), both records generate an identical boolean on-chain footprint 
              (<code>shareMet = true</code>). Cryptographic observers <strong style={{ color: '#fff' }}>cannot differentiate</strong> the underlying transactions.
            </p>
          </>
        ) : (
          <>
            <h2 style={{ color: 'var(--warn)', margin: '0 0 12px', fontSize: '1.25rem' }}>State Divergence: Threshold Not Met</h2>
            <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.65 }}>
              One or more inputs fall below the required threshold of <code>{share.toString()} tNIGHT</code>, resulting in a rejected validation state
              (<code>shareMet = false</code>). Adjust inputs to satisfy the minimum parameter and observe the footprint convergence.
            </p>
          </>
        )}
      </section>

      {/* ── What Can Be Inferred ── */}
      <section className="panel">
        <h2 style={{ margin: '0 0 12px' }}>What Can an Observer Infer?</h2>
        <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.65, fontSize: '0.9rem' }}>
          {inferredRange(outA.returned, share).text}. Zero-knowledge cryptographic circuits ensure
          individual financial amounts <strong style={{ color: '#fff' }}>never touch the public ledger</strong>.
        </p>
      </section>
    </div>
  );
}

function safeBig(s: string): bigint {
  try {
    const n = BigInt((s || '0').trim());
    return n < 0n ? 0n : n;
  } catch {
    return 0n;
  }
}
