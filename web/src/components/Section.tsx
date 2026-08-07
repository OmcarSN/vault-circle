import type { ReactNode } from 'react';

export function Section({
  title,
  subtitle,
  children,
  className = '',
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`section ${className}`.trim()}>
      {title && <h2>{title}</h2>}
      {subtitle && <p className="section-sub">{subtitle}</p>}
      {children}
    </section>
  );
}
