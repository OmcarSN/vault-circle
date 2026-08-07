import { useNavigate } from 'react-router-dom';
import { useLedger } from '../hooks/useLedger';
import { useGlobalState } from '../context/GlobalStateContext';
import { CONTRACT_ADDRESS } from '../config/network';
import { DEMO_CIRCLE } from '../config/demo';
import { PageHeader } from '../components/PageHeader';
import { CircleCard } from '../components/CircleCard';
import { DemoBanner } from '../components/DemoBanner';
import { CardSkeleton, EmptyState } from '../components/EmptyState';

export function CircleList() {
  const { ledger, error, loading } = useLedger();
  const { setActiveCircleId } = useGlobalState();
  const navigate = useNavigate();

  const open = (id: string) => {
    setActiveCircleId(id);
    navigate(`/circles/${id}`);
  };

  const hasLive = !loading && !error && ledger && CONTRACT_ADDRESS;

  return (
    <div className="page-container">
      <PageHeader
        eyebrow="Circles"
        title="Active Circles"
        subtitle="Rotating savings circles secured by zero-knowledge proofs. Contributions stay private; only threshold compliance is proven on-chain."
      />

      <DemoBanner />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <CircleCard
          variant="demo"
          name={DEMO_CIRCLE.name}
          share={DEMO_CIRCLE.requiredShare.toString()}
          members={DEMO_CIRCLE.memberCount.toString()}
          cycle={(DEMO_CIRCLE.cycleCount + 1n).toString()}
          solvent={DEMO_CIRCLE.poolSolvent}
          onOpen={() => open(DEMO_CIRCLE.id)}
        />

        {loading && <CardSkeleton rows={2} />}

        {error && (
          <div className="notice err">
            Could not load on-chain ledger data: {error.message}
          </div>
        )}

        {hasLive && (
          <CircleCard
            variant="live"
            name="Live Contract"
            address={CONTRACT_ADDRESS}
            share={ledger.requiredShare.toString()}
            members={ledger.memberCount.toString()}
            cycle={(ledger.cycleCount + 1n).toString()}
            solvent={ledger.poolSolvent}
            onOpen={() => open(CONTRACT_ADDRESS)}
          />
        )}

        {!loading && !error && !CONTRACT_ADDRESS && (
          <EmptyState title="No live contract configured">
            This deployment has no on-chain contract address set, so only the demonstration
            circle above is available. Deploy a contract and set its address to see live
            ledger data here.
          </EmptyState>
        )}
      </div>
    </div>
  );
}
