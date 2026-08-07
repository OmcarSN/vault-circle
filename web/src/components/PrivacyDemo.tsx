import { useMemo, useState } from 'react';
import {
  modelContribute,
  disclosedFingerprint,
  inferredRange,
  type PublicStateBefore,
} from '../privacy/model';
import { PageHeader } from './PageHeader';
import { EyeIcon, LockIcon } from './Icons';

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
  const converged = identical && bothMet;

  return (
    <div className="page-container page-container--narrow">
      <PageHeader
        eyebrow="Privacy Lab"
        title="Same proof, different amounts"
        subtitle="Two people deposit completely different amounts, yet the ledger records the same boolean proof for both. Adjust the numbers and watch the public footprint."
      />

      <section className="panel" style={{ marginBottom: 20 }}>
        <div className="row" style={{ marginBottom: 16 }}>
          <span className="step-badge">1</span>
          <h2 style={{ margin: 0 }}>Set the minimum share</h2>
        </div>
        <p className="sub" style={{ margin: '0 0 16px' }}>
          The minimum each member must deposit per cycle. The contract only checks whether the
          threshold was met — never the exact amount.
        </p>
        <div style={{ maxWidth: 280 }}>
          <label className="small" style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Required Share (tNIGHT)</label>
          <input type="number" min="0" value={requiredShare} onChange={(e) => setRequiredShare(e.target.value)} />
        </div>
      </section>

      <section className="panel" style={{ marginBottom: 20 }}>
        <div className="row" style={{ marginBottom: 16 }}>
          <span className="step-badge">2</span>
          <h2 style={{ margin: 0 }}>Make two private deposits</h2>
        </div>
        <p className="sub" style={{ margin: '0 0 20px' }}>
          Enter different amounts for Alice and Bob. These values are private — they never leave your
          device. Only the proof result goes on-chain.
        </p>
        <div className="grid-2">
          <Deposit name="Alice" color="#818CF8" value={amountA} onChange={setAmountA} placeholder="e.g. 100" />
          <Deposit name="Bob" color="#38BDF8" value={amountB} onChange={setAmountB} placeholder="e.g. 100000" />
        </div>
      </section>

      <div className="row" style={{ justifyContent: 'center', margin: '16px 0' }}>
        <span className="circuit-divider">ZK circuit transformation</span>
      </div>

      <section className="panel" style={{ marginBottom: 20 }}>
        <div className="row" style={{ marginBottom: 16 }}>
          <span className="step-badge">3</span>
          <h2 style={{ margin: 0 }}>What the blockchain sees</h2>
        </div>
        <p className="sub" style={{ margin: '0 0 20px' }}>
          This is all that goes on-chain: no amounts, no identity — just a yes/no proof.
        </p>
        <div className="grid-2">
          <PublicRecord name="Alice" color="#818CF8" met={outA.returned} />
          <PublicRecord name="Bob" color="#38BDF8" met={outB.returned} />
        </div>
      </section>

      <section
        className="panel"
        style={{
          marginBottom: 20,
          borderColor: converged ? 'rgba(47,182,124,.4)' : 'rgba(217,164,65,.4)',
          background: converged ? 'rgba(47,182,124,.06)' : 'rgba(217,164,65,.06)',
        }}
      >
        {converged ? (
          <>
            <h2 style={{ color: 'var(--ok)', margin: '0 0 12px' }}>Identical public footprint</h2>
            <p style={{ margin: 0, color: 'var(--text-2)', lineHeight: 1.65 }}>
              The two deposits differ ({a.toString()} vs {b.toString()}), but both produce the same
              on-chain result (<code>shareMet = true</code>). An observer cannot tell the transactions apart.
            </p>
          </>
        ) : (
          <>
            <h2 style={{ color: 'var(--warn)', margin: '0 0 12px' }}>Threshold not met</h2>
            <p style={{ margin: 0, color: 'var(--text-2)', lineHeight: 1.65 }}>
              At least one amount is below the required <code>{share.toString()} tNIGHT</code>, so its
              proof reads <code>shareMet = false</code>. Raise both amounts to see the footprints converge.
            </p>
          </>
        )}
      </section>

      <section className="panel">
        <h2 style={{ margin: '0 0 12px' }}>What can an observer infer?</h2>
        <p style={{ margin: 0, color: 'var(--text-2)', lineHeight: 1.65, fontSize: 14 }}>
          {inferredRange(outA.returned, share).text}. Individual amounts never touch the public ledger.
        </p>
      </section>
    </div>
  );
}

function Deposit({ name, color, value, onChange, placeholder }: { name: string; color: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="secret-strip">
      <div className="row" style={{ marginBottom: 10 }}>
        <span className="avatar" style={{ background: color }}>{name.charAt(0)}</span>
        <span style={{ fontWeight: 600 }}>{name}</span>
        <span className="small muted row" style={{ gap: 5 }}><LockIcon size={12} /> Private</span>
      </div>
      <input type="number" min="0" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function PublicRecord({ name, color, met }: { name: string; color: string; met: boolean }) {
  return (
    <div className="chain-strip">
      <div className="row" style={{ marginBottom: 12 }}>
        <span className="avatar" style={{ background: color }}>{name.charAt(0)}</span>
        <span style={{ fontWeight: 600, fontSize: 14 }}>{name}'s public record</span>
        <span className="small muted row" style={{ gap: 5 }}><EyeIcon size={12} /> On-chain</span>
      </div>
      <div className="kv small">
        <div className="k">Share met?</div>
        <div><span className={`badge ${met ? 'ok' : 'err'}`}><span className="dot" />{met ? 'Yes' : 'No'}</span></div>
        <div className="k">Deposit amount</div>
        <div><span className="encrypted-chip">ENCRYPTED</span></div>
      </div>
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
