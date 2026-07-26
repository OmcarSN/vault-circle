import { useNavigate } from 'react-router-dom';
import { useLedger } from '../hooks/useLedger';
import { useGlobalState } from '../context/GlobalStateContext';
import { CONTRACT_ADDRESS } from '../config/network';
import { DEMO_CIRCLE } from '../config/demo';

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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* ── Demo Circle (always visible) ── */}
        <div className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'var(--grad)', display: 'grid', placeItems: 'center',
                fontSize: '16px', fontWeight: 800, color: '#fff',
                boxShadow: '0 6px 20px -6px rgba(124, 108, 255, 0.6)',
              }}>C</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{DEMO_CIRCLE.name}</div>
                <div className="small muted">Demo Circle · {DEMO_CIRCLE.id}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <div className="stat-chip">
                <span className="stat-chip-label">Share Required</span>
                <span className="stat-chip-value">{DEMO_CIRCLE.requiredShare.toString()} tNIGHT</span>
              </div>
              <div className="stat-chip">
                <span className="stat-chip-label">Members</span>
                <span className="stat-chip-value">{DEMO_CIRCLE.memberCount.toString()}</span>
              </div>
              <div className="stat-chip">
                <span className="stat-chip-label">Cycle</span>
                <span className="stat-chip-value">{(DEMO_CIRCLE.cycleCount + 1n).toString()}</span>
              </div>
              <div className="stat-chip">
                <span className="stat-chip-label">Status</span>
                <span className={`badge ${DEMO_CIRCLE.poolSolvent ? 'ok' : 'err'}`} style={{ fontSize: '12px' }}>
                  <span className="dot" />
                  {DEMO_CIRCLE.poolSolvent ? 'Solvent' : 'Insolvent'}
                </span>
              </div>
            </div>
          </div>
          <button className="primary" onClick={() => handleJoinClick(DEMO_CIRCLE.id)}>
            Join Circle
          </button>
        </div>

        {/* ── Live Contract Circle (if configured) ── */}
        {loading && <div className="badge" style={{ alignSelf: 'flex-start' }}>Loading ledger data...</div>}

        {error && (
          <div className="badge err" style={{ marginBottom: '0.5rem', alignSelf: 'flex-start' }}>
            {error.message}
          </div>
        )}

        {!loading && !error && ledger && CONTRACT_ADDRESS && (
          <div className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #34d399, #22d3ee)',
                  display: 'grid', placeItems: 'center',
                  fontSize: '16px', fontWeight: 800, color: '#fff',
                  boxShadow: '0 6px 20px -6px rgba(52, 211, 153, 0.6)',
                }}>L</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Live Contract</div>
                  <div className="small muted mono">{CONTRACT_ADDRESS.slice(0, 10)}...{CONTRACT_ADDRESS.slice(-8)}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                <div className="stat-chip">
                  <span className="stat-chip-label">Share Required</span>
                  <span className="stat-chip-value">{ledger.requiredShare.toString()} tNIGHT</span>
                </div>
                <div className="stat-chip">
                  <span className="stat-chip-label">Members</span>
                  <span className="stat-chip-value">{ledger.memberCount.toString()}</span>
                </div>
                <div className="stat-chip">
                  <span className="stat-chip-label">Cycle</span>
                  <span className="stat-chip-value">{(ledger.cycleCount + 1n).toString()}</span>
                </div>
                <div className="stat-chip">
                  <span className="stat-chip-label">Status</span>
                  <span className={`badge ${ledger.poolSolvent ? 'ok' : 'err'}`} style={{ fontSize: '12px' }}>
                    <span className="dot" />
                    {ledger.poolSolvent ? 'Solvent' : 'Insolvent'}
                  </span>
                </div>
              </div>
            </div>
            <button className="primary" onClick={() => handleJoinClick(CONTRACT_ADDRESS)}>
              Join Circle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
