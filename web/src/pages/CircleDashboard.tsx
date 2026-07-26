import { useParams, Link } from 'react-router-dom';
import { useGlobalState } from '../context/GlobalStateContext';
import { useLedger } from '../hooks/useLedger';
import { LedgerPanel } from '../components/LedgerPanel';

export function CircleDashboard() { 
  const { id } = useParams();
  const { wallet } = useGlobalState();
  const ledgerState = useLedger();
  const isConnected = wallet.status === 'connected';

  // For the UI mockup, we'll assume the connected user is a member, but we don't know their state natively without a local DB.
  // We'll mock the private state view for the "Your Status" panel.
  const mockedMemberIndex = 2; // e.g., 3rd member
  const currentRecipientIndex = ledgerState.ledger ? Number(ledgerState.ledger.currentRecipientIndex) : 0;
  const isMyTurn = isConnected && currentRecipientIndex === mockedMemberIndex;

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Circle Dashboard</h1>
          <p style={{ opacity: 0.8, fontFamily: 'monospace' }}>Contract: {id}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to={`/circles/${id}/deposit`} className="button primary">
            Make Deposit
          </Link>
          <Link to={`/circles/${id}/payout`} className={`button ${isMyTurn ? 'ok' : 'ghost'}`} style={{ border: '1px solid var(--border)' }}>
            Claim Payout
          </Link>
        </div>
      </div>

      <div className="main-grid">
        {/* ── Public Ledger Data (👁) ── */}
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-10px', right: '10px', background: 'var(--bg-card)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            👁 Public On-Chain Record
          </div>
          <LedgerPanel ledger={ledgerState} />
        </div>

        {/* ── Private Member Status (🔒) ── */}
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-10px', right: '10px', background: 'var(--bg-card)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--ok)' }}>
            🔒 Private (Encrypted)
          </div>
          <section className="panel" style={{ border: '1px solid var(--ok)', background: 'rgba(31,81,54,0.05)' }}>
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
                <div className="mono" style={{ fontWeight: 700, color: 'var(--ok)' }}>1 / 1 (Verified)</div>

                <div className="k">Total Past Contributions</div>
                <div className="mono" style={{ fontWeight: 700 }}>500 tNIGHT</div>

                <div className="k">Payout Rotation Status</div>
                <div>
                  {isMyTurn ? (
                    <span className="badge ok"><span className="dot" /> It's your turn to claim!</span>
                  ) : (
                    <span className="badge off"><span className="dot" /> Waiting for turn (Currently member #{currentRecipientIndex + 1})</span>
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
