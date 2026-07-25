import { useMemo, useState } from 'react';
import {
  modelContribute,
  disclosedFingerprint,
  inferredRange,
  type PublicStateBefore,
} from '../privacy/model';

// ═══════════════════════════════════════════════════════════════════════
// PrivacyDemo — the "observable privacy behavior" demonstration.
//
// The claim: contribute() proves amount >= requiredShare while revealing only
// the boolean. To make that *observable*, we run two members with DIFFERENT
// secret amounts through the same public state and show their on-chain
// footprints are byte-identical. The secret is proven, never revealed.
//
// Fully client-side (mirrors the contract's disclose boundary) — no wallet,
// no proof server — so it always works and is the safe thing to screen-record.
// ═══════════════════════════════════════════════════════════════════════

export function PrivacyDemo() {
  const [requiredShare, setRequiredShare] = useState('100');
  const [amountA, setAmountA] = useState('100'); // exactly meets
  const [amountB, setAmountB] = useState('100000'); // vastly overpays

  const share = safeBig(requiredShare);
  const a = safeBig(amountA);
  const b = safeBig(amountB);

  // Same prior public state for both members, so only the secret differs.
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
    <section className="panel">
      <h2>🔍 Observable privacy</h2>
      <p className="sub">
        Prove <em>“I met the share”</em> without revealing <em>how much</em> —
        and see that the chain genuinely can’t tell two different secrets apart.
      </p>

      {/* Shared public parameter. */}
      <div className="row" style={{ marginBottom: 12 }}>
        <label className="small">
          <div className="muted" style={{ marginBottom: 4 }}>
            requiredShare (public)
          </div>
          <input
            type="number"
            min="0"
            value={requiredShare}
            onChange={(e) => setRequiredShare(e.target.value)}
          />
        </label>
      </div>

      <div className="grid2">
        <MemberColumn
          label="Member A"
          amount={amountA}
          setAmount={setAmountA}
          met={outA.returned}
        />
        <MemberColumn
          label="Member B"
          amount={amountB}
          setAmount={setAmountB}
          met={outB.returned}
        />
      </div>

      {/* The verdict. */}
      <div
        className={`notice ${identical && bothMet ? '' : 'warn'}`}
        style={{ marginTop: 16, borderColor: identical && bothMet ? '#1f5136' : undefined }}
      >
        {identical ? (
          <>
            <strong>Public footprints are identical.</strong> Members A and B
            supplied different secret amounts (<code>{a.toString()}</code> vs{' '}
            <code>{b.toString()}</code>), yet the chain records the exact same
            state. An observer sees <code>met = {String(outA.returned)}</code>{' '}
            and <em>cannot distinguish</em> the two secrets.
          </>
        ) : (
          <>
            <strong>Footprints differ — but only via the boolean.</strong> One
            amount clears the share and the other doesn’t, so{' '}
            <code>contributionMet</code> differs. Neither amount is ever
            disclosed; set both ≥ {share.toString()} to see identical footprints.
          </>
        )}
      </div>

      {/* What an observer can infer. */}
      <div className="small muted" style={{ marginTop: 14 }}>
        <div style={{ marginBottom: 4 }}>
          <strong>What the chain leaks about A’s secret:</strong>{' '}
          {inferredRange(outA.returned, share).text}.
        </div>
        The disclosed bit narrows the amount to a range of size ~2^63 — it proves
        a threshold was crossed while leaving the value itself unknown.
      </div>

      {/* Canonical footprints, for the skeptic. */}
      <details style={{ marginTop: 12 }}>
        <summary className="muted small" style={{ cursor: 'pointer' }}>
          Show the canonical on-chain footprint for each member
        </summary>
        <div className="grid2" style={{ marginTop: 10 }}>
          <pre className="addr mono small" style={{ whiteSpace: 'pre-wrap' }}>
            A → {fpA}
          </pre>
          <pre className="addr mono small" style={{ whiteSpace: 'pre-wrap' }}>
            B → {fpB}
          </pre>
        </div>
      </details>
    </section>
  );
}

function MemberColumn({
  label,
  amount,
  setAmount,
  met,
}: {
  label: string;
  amount: string;
  setAmount: (v: string) => void;
  met: boolean;
}) {
  return (
    <div>
      <div className="secret-strip">
        <div className="small muted" style={{ marginBottom: 6 }}>
          🔒 {label} — secret amount (witness, never on-chain)
        </div>
        <input
          type="number"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ width: '100%' }}
        />
      </div>

      <div className="arrow">↓ contribute()</div>

      <div className="chain-strip">
        <div className="small muted" style={{ marginBottom: 8 }}>
          👁 what the chain sees
        </div>
        <div className="kv small">
          <div className="k">contributionMet</div>
          <div>
            <span className={`badge ${met ? 'ok' : 'off'}`}>
              <span className="dot" />
              {String(met)}
            </span>
          </div>
          <div className="k">poolTotal +=</div>
          <div className="mono">requiredShare</div>
          <div className="k">count +=</div>
          <div className="mono">1</div>
          <div className="k">amount</div>
          <div className="mono strike">never disclosed</div>
        </div>
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
