import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGlobalState } from '../context/GlobalStateContext';
import { useLedger } from '../hooks/useLedger';
import { usePayout } from '../hooks/usePayout';
import { isDemoCircle, DEMO_CIRCLE } from '../config/demo';
import { PageHeader } from '../components/PageHeader';
import { DemoBanner } from '../components/DemoBanner';
import { ProofServerRow } from '../components/ProofServerRow';
import { CheckIcon } from '../components/Icons';

export function PayoutPage() {
  const { id } = useParams();
  const { wallet } = useGlobalState();
  const call = usePayout();
  const ledgerState = useLedger();
  const isDemo = isDemoCircle(id);

  const connected = wallet.status === 'connected' && wallet.connection;
  const { phase, proofServer, result, error, hasContract } = call;

  const [demoPhase, setDemoPhase] = useState<'idle' | 'proving' | 'done'>('idle');
  const [demoResult, setDemoResult] = useState<{ txId: string } | null>(null);

  const busy = isDemo ? demoPhase === 'proving' : phase === 'checking' || phase === 'proving';

  // Demo hardcodes this caller as member #3 (index 2) to show the happy path.
  const mockedMemberIndex = 2;
  const currentRecipientIndex = isDemo
    ? Number(DEMO_CIRCLE.currentRecipientIndex)
    : ledgerState.ledger ? Number(ledgerState.ledger.currentRecipientIndex) : 0;

  const isMyTurn = connected && currentRecipientIndex === mockedMemberIndex;
  const poolSolvent = isDemo ? DEMO_CIRCLE.poolSolvent : ledgerState.ledger ? ledgerState.ledger.poolSolvent : false;
  const poolTotal = isDemo ? DEMO_CIRCLE.poolTotal.toString() : ledgerState.ledger ? ledgerState.ledger.poolTotal.toString() : '0';

  const canClaim = isMyTurn && poolSolvent;
  const canSubmit = !!connected && !busy && !!canClaim;

  const onSubmit = async () => {
    if (!connected) return;
    if (isDemo) {
      setDemoPhase('proving');
      setDemoResult(null);
      await new Promise((resolve) => setTimeout(resolve, 2500));
      setDemoResult({ txId: '0x' + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('') });
      setDemoPhase('done');
      return;
    }
    await call.claimPayout(wallet.connection!, id as string);
    if (ledgerState.hasAddress) void ledgerState.refresh();
  };

  return (
    <div className="page-container page-container--narrow">
      <PageHeader
        eyebrow="Rotation payout"
        title="Claim Payout"
        subtitle={<span className="mono">{id}</span>}
        backTo={`/circles/${id}`}
        backLabel="Back to Dashboard"
      />
      {isDemo && <DemoBanner note="The claim below is simulated locally; no funds move." />}

      <section className="panel">
        {!isMyTurn ? (
          <div className="notice warn" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <h3 style={{ margin: '0 0 12px' }}>Not your turn yet</h3>
            <p style={{ margin: 0, opacity: 0.85 }}>
              This cycle's payout is reserved for member <strong>#{currentRecipientIndex + 1}</strong>.
              {connected && <> You are recognized as member <strong>#{mockedMemberIndex + 1}</strong>.</>}
              {!connected && <> Connect your wallet to check your rotation position.</>}
            </p>
          </div>
        ) : !poolSolvent ? (
          <div className="notice err" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <h3 style={{ margin: '0 0 12px' }}>Pool not yet solvent</h3>
            <p style={{ margin: 0, opacity: 0.85 }}>It is your turn, but the circle has not met the required share threshold for this cycle.</p>
          </div>
        ) : (
          <div>
            <div className="chain-strip" style={{ textAlign: 'center', padding: 24 }}>
              <h2 style={{ margin: '0 0 8px', color: 'var(--ok)', fontFamily: 'var(--font-display)' }}>It's your turn</h2>
              <p style={{ margin: 0, color: 'var(--text-2)' }}>The pool is fully solvent and you are the designated recipient for this cycle.</p>
              <div className="mono" style={{ fontSize: 32, fontWeight: 600, marginTop: 16, color: 'var(--text)' }}>{poolTotal} tNIGHT</div>
              <div className="small muted">Total claimable pool balance</div>
            </div>

            {isDemo ? (
              <div className="notice" style={{ marginTop: 20 }}>
                <span className="badge warn"><span className="dot" /> Local proof simulation</span>
              </div>
            ) : (
              <ProofServerRow status={proofServer} onRecheck={call.recheckProofServer} style={{ marginTop: 20 }} />
            )}

            <div className="row spread" style={{ marginTop: 24 }}>
              <div>
                {!connected && <span className="small muted">Connect your Lace wallet to participate.</span>}
                {connected && !hasContract && !isDemo && <span className="small muted">Simulated locally — no contract deployed.</span>}
              </div>
              <button className="primary" onClick={onSubmit} disabled={!canSubmit}>
                {isDemo
                  ? demoPhase === 'proving' ? 'Generating ZK Proof…' : 'Claim Entire Pool'
                  : phase === 'checking' ? 'Verifying Engine…'
                    : phase === 'proving' ? 'Generating ZK Proof…'
                      : 'Claim Entire Pool'}
              </button>
            </div>
          </div>
        )}

        {isDemo && demoPhase === 'done' && demoResult && (
          <div className="notice" style={{ marginTop: 24, borderColor: 'rgba(47,182,124,.35)', background: 'rgba(47,182,124,.07)' }}>
            <div className="row"><CheckIcon style={{ color: 'var(--ok)' }} /><strong>Payout claimed</strong> · The circle has rotated to the next recipient.</div>
            <div className="small muted" style={{ marginTop: 6 }}>Simulated transaction: <span className="mono">{demoResult.txId}</span></div>
          </div>
        )}
        {!isDemo && phase === 'done' && result && (
          <div className="notice" style={{ marginTop: 24, borderColor: 'rgba(47,182,124,.35)', background: 'rgba(47,182,124,.07)' }}>
            <div className="row"><CheckIcon style={{ color: 'var(--ok)' }} /><strong>Payout claimed</strong> · The circle has rotated to the next recipient.</div>
            <div className="small muted" style={{ marginTop: 6 }}>Transaction hash: <span className="mono">{result.txId}</span></div>
          </div>
        )}
        {!isDemo && phase === 'error' && error && <div className="notice err" style={{ marginTop: 24 }}>{error}</div>}
      </section>
    </div>
  );
}
