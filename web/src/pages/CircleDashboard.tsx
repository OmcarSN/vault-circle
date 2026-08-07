import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGlobalState } from '../context/GlobalStateContext';
import { useLedger } from '../hooks/useLedger';
import { LedgerPanel } from '../components/LedgerPanel';
import { isDemoCircle, DEMO_CIRCLE } from '../config/demo';
import { PageHeader } from '../components/PageHeader';
import { DemoBanner } from '../components/DemoBanner';
import { CardSkeleton, EmptyState } from '../components/EmptyState';
import { EyeIcon, LockIcon } from '../components/Icons';

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
  const circleName = isDemo ? DEMO_CIRCLE.name : `Circle ${id?.slice(0, 8)}…`;

  // Live-circle load states (demo always has data).
  const liveLoading = !isDemo && ledgerState.loading;
  const liveError = !isDemo && ledgerState.error;
  const liveEmpty = !isDemo && !ledgerState.loading && !ledgerState.error && !ledgerState.ledger;

  return (
    <div className="page-container">
      <PageHeader
        eyebrow="Circle dashboard"
        title={circleName}
        subtitle={<span className="mono">{id}</span>}
        backTo="/circles"
        backLabel="Back to Circles"
        actions={
          <>
            <Link to={`/circles/${id}/deposit`}><button className="primary">Make Deposit</button></Link>
            <Link to={`/circles/${id}/payout`}><button className={isMyTurn ? 'primary' : 'ghost'}>Claim Payout</button></Link>
          </>
        }
      />

      {isDemo && <DemoBanner />}

      <p className="privacy-legend" style={{ marginBottom: 20 }}>
        <span><EyeIcon /> Public on-chain state</span>
        <span><LockIcon /> Private, decrypted locally</span>
      </p>

      {liveLoading && <CardSkeleton rows={4} />}
      {liveError && (
        <div className="notice err">Could not load ledger data: {ledgerState.error?.message}</div>
      )}
      {liveEmpty && (
        <EmptyState title="No ledger data yet">
          This circle has no readable on-chain state. Confirm the contract address is deployed and
          reachable, then refresh.
        </EmptyState>
      )}

      {circleData && (
        <div className="stats-grid">
          <StatTile label="Pool Balance" value={circleData.poolTotal.toString()} sub="tNIGHT" />
          <StatTile label="Required Share" value={circleData.requiredShare.toString()} sub="tNIGHT per cycle" />
          <StatTile label="Members" value={circleData.memberCount.toString()} sub="active participants" />
          <StatTile
            label="Solvency"
            value={circleData.poolSolvent ? 'Solvent' : 'Insolvent'}
            valueColor={circleData.poolSolvent ? 'var(--ok)' : 'var(--danger)'}
            sub={`Cycle ${(circleData.cycleCount + 1n).toString()}`}
          />
        </div>
      )}

      {circleData && (
        <div className="main-grid">
          <div>
            {isDemo ? (
              <section className="panel">
                <h2><EyeIcon size={16} /> Public Ledger State</h2>
                <p className="sub">Data visible to every network participant.</p>
                <div className="kv" style={{ marginTop: 16 }}>
                  <div className="k">Pool Total</div><div className="mono" style={{ fontWeight: 700 }}>{circleData.poolTotal.toString()} tNIGHT</div>
                  <div className="k">Required Share</div><div className="mono" style={{ fontWeight: 700 }}>{circleData.requiredShare.toString()} tNIGHT</div>
                  <div className="k">Member Count</div><div className="mono" style={{ fontWeight: 700 }}>{circleData.memberCount.toString()}</div>
                  <div className="k">Current Cycle</div><div className="mono" style={{ fontWeight: 700 }}>{(circleData.cycleCount + 1n).toString()}</div>
                  <div className="k">Recipient Index</div><div className="mono" style={{ fontWeight: 700 }}>{circleData.currentRecipientIndex.toString()}</div>
                  <div className="k">Pool Solvent</div>
                  <div><span className={`badge ${circleData.poolSolvent ? 'ok' : 'err'}`}><span className="dot" />{circleData.poolSolvent ? 'Yes' : 'No'}</span></div>
                </div>
              </section>
            ) : (
              <LedgerPanel ledger={ledgerState} />
            )}
          </div>

          <section className="panel" style={{ border: '1px solid rgba(47,182,124,.25)' }}>
            <h2><LockIcon size={16} /> Your Status</h2>
            <p className="sub">
              {isDemo
                ? 'Illustrative member data for the demonstration circle — generated locally, not decrypted from a wallet.'
                : 'Decrypted locally using your connected wallet. Never visible to the network or other members.'}
            </p>
            {!isConnected ? (
              <div className="notice warn" style={{ marginTop: 20 }}>Connect your Lace wallet to view your private circle status.</div>
            ) : (
              <div className="kv" style={{ marginTop: 24 }}>
                <div className="k">Your Identity</div><div className="mono" style={{ fontWeight: 700 }}>Anonymous Member #{mockedMemberIndex + 1}</div>
                <div className="k">Contributions This Cycle</div><div className="mono" style={{ fontWeight: 700, color: 'var(--ok)' }}>1 / 1 verified</div>
                <div className="k">Total Past Contributions</div><div className="mono" style={{ fontWeight: 700 }}>500 tNIGHT</div>
                <div className="k">Payout Rotation</div>
                <div>
                  {isMyTurn
                    ? <span className="badge ok"><span className="dot" /> Your turn to claim</span>
                    : <span className="badge off"><span className="dot" /> Waiting — current is member #{currentRecipientIndex + 1}</span>}
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function StatTile({ label, value, sub, valueColor }: { label: string; value: string; sub: string; valueColor?: string }) {
  return (
    <div className="stat-card">
      <div className="stat-title">{label} <EyeIcon size={13} style={{ color: 'var(--muted)' }} /></div>
      <div className="stat-value" style={valueColor ? { color: valueColor } : undefined}>{value}</div>
      <div className="stat-subtitle">{sub}</div>
    </div>
  );
}
