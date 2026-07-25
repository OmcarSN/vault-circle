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
    <section className="panel" style={{ marginTop: 24 }}>
      <h2><span>🧪</span> Zero-Knowledge Privacy Simulator</h2>
      <p className="sub">
        Test how two members can deposit completely different secret amounts while producing the exact same public proof on the blockchain.
      </p>

      {/* Target Share Config */}
      <div style={{ marginBottom: 20, maxWidth: 300 }}>
        <label className="small muted" style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>
          Circle Required Share Target (tNIGHT)
        </label>
        <input
          type="number"
          min="0"
          value={requiredShare}
          onChange={(e) => setRequiredShare(e.target.value)}
        />
      </div>

      <div className="grid2">
        <MemberColumn
          label="Member A (Alice)"
          amount={amountA}
          setAmount={setAmountA}
          met={outA.returned}
        />
        <MemberColumn
          label="Member B (Bob)"
          amount={amountB}
          setAmount={setAmountB}
          met={outB.returned}
        />
      </div>

      {/* The verdict. */}
      <div
        className={`notice ${identical && bothMet ? '' : 'warn'}`}
        style={{ marginTop: 20, borderColor: identical && bothMet ? '#1f5136' : undefined, background: identical && bothMet ? 'rgba(31,81,54,0.15)' : undefined }}
      >
        {identical ? (
          <>
            <strong>🎉 Public On-Chain Footprints are Identical!</strong>
            <br />
            Alice deposited <code>{a.toString()} tNIGHT</code> and Bob deposited <code>{b.toString()} tNIGHT</code>.
            To the public blockchain, both generated the exact same verified record: <code>shareMet = {String(outA.returned)}</code>. An outside observer cannot tell their financial balance apart!
          </>
        ) : (
          <>
            <strong>Footprints Differ (Threshold Not Met)</strong>
            <br />
            One member's deposit did not meet the required <code>{share.toString()} tNIGHT</code> share. Increase their deposit to see identical privacy footprints.
          </>
        )}
      </div>

      {/* What an observer can infer */}
      <div className="small muted" style={{ marginTop: 16 }}>
        <strong>Privacy Leakage Analysis:</strong> {inferredRange(outA.returned, share).text}. Zero-knowledge cryptographic circuits ensure individual financial amounts never touch the public ledger.
      </div>
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
        <div className="small muted" style={{ marginBottom: 8, fontWeight: 600 }}>
          🔒 {label} — Secret Deposit Input
        </div>
        <input
          type="number"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div className="arrow">⬇ Zero-Knowledge Proof Circuit</div>

      <div className="chain-strip">
        <div className="small muted" style={{ marginBottom: 10, fontWeight: 600 }}>
          👁️ What the Blockchain Records
        </div>
        <div className="kv small">
          <div className="k">Target Share Met?</div>
          <div>
            <span className={`badge ${met ? 'ok' : 'off'}`}>
              <span className="dot" />
              {String(met)}
            </span>
          </div>
          <div className="k">Pool Total Grown By</div>
          <div className="mono">Target Share</div>
          <div className="k">Deposit Amount</div>
          <div className="mono strike">Hidden / Encrypted</div>
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
