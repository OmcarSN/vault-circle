import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from './Icons';

// Shared page heading — replaces the hand-rolled gradient <h1> + subtitle +
// back-link + action-row that was copy-pasted across every page.
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  backTo,
  backLabel = 'Back',
}: {
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  backTo?: string;
  backLabel?: string;
}) {
  const navigate = useNavigate();
  return (
    <div className="page-header">
      {backTo && (
        <button className="back-link" onClick={() => navigate(backTo)}>
          <ArrowLeftIcon size={13} /> {backLabel}
        </button>
      )}
      <div className="header-row">
        <div>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1>{title}</h1>
          {subtitle && <p className="subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="row">{actions}</div>}
      </div>
    </div>
  );
}
