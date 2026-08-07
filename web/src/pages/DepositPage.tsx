import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGlobalState } from '../context/GlobalStateContext';
import { useContribute } from '../hooks/useContribute';
import { useLedger } from '../hooks/useLedger';
import { isDemoCircle, DEMO_CIRCLE } from '../config/demo';
import { PageHeader } from '../components/PageHeader';
import { DemoBanner } from '../components/DemoBanner';
import { ProofServerRow } from '../components/ProofServerRow';
import { CheckIcon, EyeIcon, LockIcon } from '../components/Icons';

export function DepositPage() {
  const { id } = useParams();
  const { wallet } = useGlobalState();
  const call = useContribute();
  const ledger = useLedger();
  const isDemo = isDemoCircle(id);

  const [amount, setAmount] = useState('100');
  const connected = wallet.status === 'connected' && wallet.connection;
  const { phase, proofServer, result, error, hasContract } = call;
  const [demoPhase, setDemoPhase] = useState<'idle' | 'proving' | 'done'>('idle');
  const [demoResult, setDemoResult] = useState<{ shareMet: boolean; txId: string } | null>(null);

  const busy = isDemo ? demoPhase === 'proving' : phase === 'checking' || phase === 'proving';
  const validation = useMemo(() => {
    const trimmed = amount.trim();
    if (!trimmed) return 'Enter a contribution amount.';
    try {
      if (BigInt(trimmed) < 0n) return 'Amount must be zero or greater.';
    } catch {
      return 'Enter a whole-number amount.';
    }
    return null;
  }, [amount]);
  const canSubmit = !!connected && !busy && !validation;

  const onSubmit = async () => {
    if (!connected || validation) return;
    if (isDemo) {
      setDemoPhase('proving');
      setDemoResult(null);
      await new Promise((resolve) => setTimeout(resolve, 2200));
      const parsed = BigInt(amount.trim());
      setDemoResult({
        shareMet: parsed >= DEMO_CIRCLE.requiredShare,
        txId: '0x' + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      });
      setDemoPhase('done');
      return;
    }
    await call.contribute(wallet.connection!, BigInt(amount.trim()));
    if (ledger.hasAddress) void ledger.refresh();
  };

  return (
    <div className="page-container page-container--narrow">
      <PageHeader
        eyebrow="Private contribution"
        title="Deposit to Circle"
        subtitle={<span className="mono">Contract: {id}</span>}
        backTo={`/circles/${id}`}
        backLabel="Back to Dashboard"
      />
      {isDemo && <DemoBanner note="The proof and transaction hash below are simulated locally." />}

      <section className="panel">
        <p className="sub">Contribute your cycle share without disclosing the exact amount to other members.</p>

        {isDemo ? (
          <div className="notice">
            <span className="badge warn"><span className="dot" /> Local proof simulation</span>
          </div>
        ) : (
          <ProofServerRow status={proofServer} onRecheck={call.recheckProofServer} />
        )}

        <div className="grid-2" style={{ marginTop: 20 }}>
          <div className="secret-strip">
            <div className="row" style={{ color: 'var(--ok)', fontSize: 13, fontWeight: 600, marginBottom: 6 }}><LockIcon /> Stays private</div>
            <p className="small muted" style={{ margin: 0 }}>Your exact amount is encrypted on this device and never published to other members.</p>
          </div>
          <div className="chain-strip" style={{ borderColor: 'var(--border)' }}>
            <div className="row" style={{ color: 'var(--accent-blue)', fontSize: 13, fontWeight: 600, marginBottom: 6 }}><EyeIcon /> Public result</div>
            <p className="small muted" style={{ margin: 0 }}>The proof only discloses whether the required share threshold was met.</p>
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <label className="secret-strip" style={{ display: 'block' }}>
            <div className="small" style={{ marginBottom: 8, fontWeight: 600 }}>Contribution amount (tNIGHT)</div>
            <input
              type="number"
              min="0"
              step="1"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              disabled={busy}
              placeholder="100"
              aria-invalid={!!validation}
              aria-describedby="amount-validation"
            />
            <div id="amount-validation" className={`small ${validation ? '' : 'muted'}`} style={{ color: validation ? 'var(--danger)' : undefined, marginTop: 7 }}>
              {validation ?? `Required share: ${DEMO_CIRCLE.requiredShare.toString()} tNIGHT`}
            </div>
          </label>
        </div>

        <div className="row spread" style={{ marginTop: 24 }}>
          <div>
            {!connected && <span className="small muted">Connect your Lace wallet to participate.</span>}
            {connected && !hasContract && !isDemo && <span className="small muted">Simulated locally — no contract deployed.</span>}
          </div>
          <button className="primary" onClick={onSubmit} disabled={!canSubmit}>
            {isDemo
              ? demoPhase === 'proving' ? 'Generating ZK Proof…' : 'Deposit & Prove Share'
              : phase === 'checking' ? 'Verifying Engine…'
                : phase === 'proving' ? 'Generating ZK Proof…'
                  : 'Deposit & Prove Share'}
          </button>
        </div>

        {isDemo && demoPhase === 'done' && demoResult && (
          <div className="notice" style={{ marginTop: 24, borderColor: 'rgba(47,182,124,.35)', background: 'rgba(47,182,124,.07)' }}>
            <div className="row"><CheckIcon style={{ color: 'var(--ok)' }} /><strong>Deposit verified</strong> · Disclosed result: <code>shareMet = {String(demoResult.shareMet)}</code></div>
            <div className="small muted" style={{ marginTop: 6 }}>Simulated transaction: <span className="mono">{demoResult.txId}</span></div>
          </div>
        )}
        {!isDemo && phase === 'done' && result && (
          <div className="notice" style={{ marginTop: 24, borderColor: 'rgba(47,182,124,.35)', background: 'rgba(47,182,124,.07)' }}>
            <div className="row"><CheckIcon style={{ color: 'var(--ok)' }} /><strong>Deposit verified</strong> · Disclosed result: <code>shareMet = {String(result.returnValue)}</code></div>
            <div className="small muted" style={{ marginTop: 6 }}>Transaction hash: <span className="mono">{result.txId}</span></div>
          </div>
        )}
        {!isDemo && phase === 'error' && error && <div className="notice err" style={{ marginTop: 24 }}>{error}</div>}
      </section>
    </div>
  );
}
