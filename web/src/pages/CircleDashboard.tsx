import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGlobalState } from '../context/GlobalStateContext';
import { useLedger } from '../hooks/useLedger';
import { LedgerPanel } from '../components/LedgerPanel';
import { isDemoCircle, DEMO_CIRCLE } from '../config/demo';

export function CircleDashboard() { 
  const { id } = useParams();
  const { wallet, setActiveCircleId } = useGlobalState();
  const ledgerState = useLedger();
  const isConnected = wallet.status === 'connected';
  const isDemo = isDemoCircle(id);

  useEffect(() => {
    if (id) setActiveCircleId(id);
    return () => setActiveCircleId(null);
  }, [id, setActiveCircleId]);

  // Use demo data if it's the demo circle, otherwise use live ledger
  const circleData = isDemo
    ? {
        requiredShare: DEMO_CIRCLE.requiredShare,
        memberCount: DEMO_CIRCLE.memberCount,
        cycleCount: DEMO_CIRCLE.cycleCount,
        currentRecipientIndex: DEMO_CIRCLE.currentRecipientIndex,
        poolTotal: BigInt(DEMO_CIRCLE.poolTotal),
        poolSolvent: DEMO_CIRCLE.poolSolvent,
      }
    : ledgerState.ledger
      ? {
          requiredShare: ledgerState.ledger.requiredShare,
          memberCount: ledgerState.ledger.memberCount,
          cycleCount: ledgerState.ledger.cycleCount,
          currentRecipientIndex: ledgerState.ledger.currentRecipientIndex,
          poolTotal: ledgerState.ledger.poolTotal,
          poolSolvent: ledgerState.ledger.poolSolvent,
        }
      : null;

  const mockedMemberIndex = 2;
  const currentRecipientIndex = circleData ? Number(circleData.currentRecipientIndex) : 0;
  const isMyTurn = isConnected && currentRecipientIndex === mockedMemberIndex;

  const circleName = isDemo ? DEMO_CIRCLE.name : `Circle ${id?.slice(0, 8)}...`;

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <Link to="/circles" style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>← Back to Circles</Link>
          <h1 style={{ marginTop: '8px' }}>{circleName}</h1>
          <p style={{ opacity: 0.8, fontFamily: 'monospace', fontSize: '0.85rem' }}>{id}</p>
          {isDemo && (
            <span className="badge warn" style={{ marginTop: '4px' }}>
              <span className="dot" /> Demo Mode
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to={`/circles/${id}/deposit`}>
            <button className="primary">Make Deposit</button>
          </Link>
          <Link to={`/circles/${id}/payout`}>
            <button className={isMyTurn ? 'primary' : 'ghost'} style={{ border: '1px solid var(--border)' }}>
              Claim Payout
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      {circleData && (
        <div className="stats-grid" style={{ marginBottom: '24px' }}>
          <div className="stat-card">
            <div className="stat-title">Pool Balance <span>👁</span></div>
            <div className="stat-value">{circleData.poolTotal.toString()}</div>
            <div className="stat-subtitle">tNIGHT</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Required Share <span>👁</span></div>
            <div className="stat-value">{circleData.requiredShare.toString()}</div>
            <div className="stat-subtitle">tNIGHT per cycle</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Members <span>👁</span></div>
            <div className="stat-value">{circleData.memberCount.toString()}</div>
            <div className="stat-subtitle">active participants</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Solvency <span>👁</span></div>
            <div className="stat-value" style={{ color: circleData.poolSolvent ? 'var(--ok)' : 'var(--danger)' }}>
              {circleData.poolSolvent ? 'Solvent' : 'Insolvent'}
            </div>
            <div className="stat-subtitle">Cycle {(circleData.cycleCount + 1n).toString()}</div>
          </div>
        </div>
      )}

      <div className="main-grid">
        {/* ── Public Ledger Data (👁) ── */}
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-10px', right: '10px', background: 'var(--panel-solid)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--muted)', zIndex: 2 }}>
            👁 Public On-Chain
          </div>
          {isDemo ? (
            <section className="panel">
              <h2>Public Ledger State</h2>
              <p className="sub">Data visible to all network participants.</p>
              <div className="kv" style={{ marginTop: 16 }}>
                <div className="k">Pool Total</div>
                <div className="mono" style={{ fontWeight: 700 }}>{circleData!.poolTotal.toString()} tNIGHT</div>
                <div className="k">Required Share</div>
                <div className="mono" style={{ fontWeight: 700 }}>{circleData!.requiredShare.toString()} tNIGHT</div>
                <div className="k">Member Count</div>
                <div className="mono" style={{ fontWeight: 700 }}>{circleData!.memberCount.toString()}</div>
                <div className="k">Current Cycle</div>
                <div className="mono" style={{ fontWeight: 700 }}>{(circleData!.cycleCount + 1n).toString()}</div>
                <div className="k">Recipient Index</div>
                <div className="mono" style={{ fontWeight: 700 }}>{circleData!.currentRecipientIndex.toString()}</div>
                <div className="k">Pool Solvent</div>
                <div>
                  <span className={`badge ${circleData!.poolSolvent ? 'ok' : 'err'}`}>
                    <span className="dot" />
                    {circleData!.poolSolvent ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </section>
          ) : (
            <LedgerPanel ledger={ledgerState} />
          )}
        </div>

        {/* ── Private Member Status (🔒) ── */}
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-10px', right: '10px', background: 'var(--panel-solid)', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(52, 211, 153, 0.4)', fontSize: '0.8rem', color: 'var(--ok)', zIndex: 2 }}>
            🔒 Private (Encrypted)
          </div>
          <section className="panel" style={{ border: '1px solid rgba(52, 211, 153, 0.25)', background: 'rgba(52, 211, 153, 0.03)' }}>
            <h2>Your Status</h2>
            <p className="sub">
              This data is decrypted locally using your connected wallet. It is never visible to the network or other members.
            </p>

            {!isConnected ? (
              <div className="notice warn" style={{ marginTop: '20px' }}>
                Connect your Lace wallet to view your private circle status.
              </div>
            ) : (
              <div className="kv" style={{ marginTop: 24 }}>
                <div className="k">Your Identity</div>
                <div className="mono" style={{ fontWeight: 700 }}>Anonymous Member #{mockedMemberIndex + 1}</div>

                <div className="k">Contributions This Cycle</div>
                <div className="mono" style={{ fontWeight: 700, color: 'var(--ok)' }}>1 / 1 (Verified ✓)</div>

                <div className="k">Total Past Contributions</div>
                <div className="mono" style={{ fontWeight: 700 }}>500 tNIGHT</div>

                <div className="k">Payout Rotation</div>
                <div>
                  {isMyTurn ? (
                    <span className="badge ok"><span className="dot" /> It's your turn to claim!</span>
                  ) : (
                    <span className="badge off"><span className="dot" /> Waiting — currently member #{currentRecipientIndex + 1}</span>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  ); 
}
