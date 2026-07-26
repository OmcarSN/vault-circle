import { useNavigate } from 'react-router-dom';
import { useLedger } from '../hooks/useLedger';
import { useGlobalState } from '../context/GlobalStateContext';
import { CONTRACT_ADDRESS } from '../config/network';

export function CircleList() {
  const { ledger, error, loading } = useLedger();
  const { setActiveCircleId } = useGlobalState();
  const navigate = useNavigate();

  const handleJoinClick = (id: string) => {
    setActiveCircleId(id);
    navigate(`/circles/${id}`);
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Active Circles</h1>
          <p style={{ opacity: 0.8 }}>Discover and join privacy-preserving rotating savings circles.</p>
        </div>
      </div>

      {loading && <div className="badge">Loading ledger data...</div>}

      {error && (
        <div className="badge danger" style={{ marginBottom: '1rem' }}>
          {error.message}
        </div>
      )}

      {/* Render the single known contract if we have it */}
      {!loading && !error && ledger && CONTRACT_ADDRESS && (
        <div className="stat-grid" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="stat-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left', padding: '24px' }}>
            <div style={{ flex: 1 }}>
              <div className="stat-title" style={{ fontSize: '1.2rem', marginBottom: '8px' }}>
                Circle: <span style={{ fontFamily: 'monospace' }}>{CONTRACT_ADDRESS.slice(0, 8)}...{CONTRACT_ADDRESS.slice(-8)}</span>
              </div>
              <div style={{ display: 'flex', gap: '24px', opacity: 0.9 }}>
                <div>
                  <strong>Share:</strong> {ledger.requiredShare.toString()} tNIGHT
                </div>
                <div>
                  <strong>Members:</strong> {ledger.memberCount.toString()}
                </div>
                <div>
                  <strong>Cycle:</strong> {(ledger.cycleCount + 1n).toString()}
                </div>
                <div>
                  <strong>Status:</strong>{' '}
                  <span className={`badge ${ledger.poolSolvent ? 'ok' : 'danger'}`}>
                    {ledger.poolSolvent ? 'Solvent' : 'Insolvent'}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <button className="primary" onClick={() => handleJoinClick(CONTRACT_ADDRESS)}>
                Join Circle
              </button>
            </div>
          </div>
        </div>
      )}

      {!loading && (!CONTRACT_ADDRESS || (!ledger && !error)) && (
        <div className="stat-card" style={{ textAlign: 'center', padding: '40px', opacity: 0.8 }}>
          <p>No active circles found.</p>
          <p style={{ fontSize: '0.9rem' }}>A contract address must be configured to view public ledger data.</p>
        </div>
      )}
    </div>
  );
}
