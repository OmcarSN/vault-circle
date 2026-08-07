import { ArrowRightIcon } from './Icons';

// One card for both the demo and live circles in CircleList — collapses the two
// near-duplicate blocks that existed before. The CTA navigates to the circle
// dashboard, so it is labelled "View Circle" (not "Join").
export function CircleCard({
  variant,
  name,
  address,
  share,
  members,
  cycle,
  solvent,
  onOpen,
}: {
  variant: 'demo' | 'live';
  name: string;
  address?: string;
  share: string;
  members: string;
  cycle: string;
  solvent: boolean;
  onOpen: () => void;
}) {
  const initial = name.charAt(0).toUpperCase();
  const meta =
    variant === 'demo'
      ? 'Demonstration circle'
      : address
        ? `${address.slice(0, 10)}…${address.slice(-8)}`
        : 'Live contract';

  return (
    <div className="panel circle-card">
      <div className="circle-card-head">
        <div className="row" style={{ gap: 12, flexWrap: 'nowrap' }}>
          <span
            aria-hidden
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: variant === 'demo' ? 'var(--surface-2)' : 'var(--accent-weak)',
              border: '1px solid var(--border)',
              display: 'grid',
              placeItems: 'center',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              color: variant === 'demo' ? 'var(--text-2)' : 'var(--accent-blue)',
              flex: 'none',
            }}
          >
            {initial}
          </span>
          <div>
            <div className="circle-card-title">{name}</div>
            <div className="small muted mono">{meta}</div>
          </div>
        </div>
        <span className={`badge ${solvent ? 'ok' : 'err'}`}>
          <span className="dot" />
          {solvent ? 'Solvent' : 'Insolvent'}
        </span>
      </div>

      <div className="row" style={{ gap: 40 }}>
        <div className="stat-chip">
          <span className="stat-chip-label">Share Required</span>
          <span className="stat-chip-value">{share} tNIGHT</span>
        </div>
        <div className="stat-chip">
          <span className="stat-chip-label">Members</span>
          <span className="stat-chip-value">{members}</span>
        </div>
        <div className="stat-chip">
          <span className="stat-chip-label">Cycle</span>
          <span className="stat-chip-value">{cycle}</span>
        </div>
      </div>

      <div className="row spread">
        <span className="small muted">
          {variant === 'demo' ? 'Explore the flow with sample data' : 'Connected on-chain contract'}
        </span>
        <button className="primary" onClick={onOpen}>
          View Circle <ArrowRightIcon size={13} style={{ marginLeft: 2, verticalAlign: '-2px' }} />
        </button>
      </div>
    </div>
  );
}
