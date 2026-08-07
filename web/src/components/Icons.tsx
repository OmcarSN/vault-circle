// Line-icon set — replaces emoji used as semantic markers across the app.
// Stroke-based, currentColor, sized to match the nav icons in Layout.tsx.
import type { CSSProperties } from 'react';

type IconProps = { size?: number; style?: CSSProperties; className?: string };

function base(size: number, style?: CSSProperties, className?: string) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    style,
    className,
  };
}

export function LockIcon({ size = 14, style, className }: IconProps) {
  return (
    <svg {...base(size, style, className)}>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export function EyeIcon({ size = 14, style, className }: IconProps) {
  return (
    <svg {...base(size, style, className)}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function ShieldIcon({ size = 14, style, className }: IconProps) {
  return (
    <svg {...base(size, style, className)}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

export function WalletIcon({ size = 14, style, className }: IconProps) {
  return (
    <svg {...base(size, style, className)}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 10H2M6 16h4" />
    </svg>
  );
}

export function ArrowLeftIcon({ size = 14, style, className }: IconProps) {
  return (
    <svg {...base(size, style, className)}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

export function ArrowRightIcon({ size = 14, style, className }: IconProps) {
  return (
    <svg {...base(size, style, className)}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export function CheckIcon({ size = 14, style, className }: IconProps) {
  return (
    <svg {...base(size, style, className)}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function AlertIcon({ size = 14, style, className }: IconProps) {
  return (
    <svg {...base(size, style, className)}>
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export function GitHubIcon({ size = 16, style, className }: IconProps) {
  return (
    <svg {...base(size, style, className)}>
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

export function CoinsIcon({ size = 14, style, className }: IconProps) {
  return (
    <svg {...base(size, style, className)}>
      <circle cx="8" cy="8" r="6" />
      <path d="M18.09 10.37A6 6 0 1 1 10.34 18M7 6h1v4M16.71 13.88l.7.71-2.82 2.82" />
    </svg>
  );
}
