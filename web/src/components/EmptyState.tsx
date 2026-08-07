import type { ReactNode } from 'react';
import { ShieldIcon } from './Icons';

export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <ShieldIcon size={28} />
      <h3>{title}</h3>
      <p>{children}</p>
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}

export function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="panel" aria-label="Loading" aria-busy="true">
      <div className="skeleton" style={{ height: 20, width: '42%', marginBottom: 18 }} />
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="skeleton"
          style={{ height: 12, width: `${88 - index * 12}%`, marginBottom: 12 }}
        />
      ))}
    </div>
  );
}
