// ═══════════════════════════════════════════════════════════════════════
// Browser entry point.
//
// Buffer polyfill: several Midnight packages (and the DApp connector's
// address/CBOR handling) assume Node's Buffer exists as a global in the
// browser. We install it before anything else imports those packages.
// ═══════════════════════════════════════════════════════════════════════
import { Buffer } from 'buffer';

const g = globalThis as typeof globalThis & { Buffer?: typeof Buffer };
if (typeof g.Buffer === 'undefined') {
  g.Buffer = Buffer;
}

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';
import './styles.css';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element #root not found');

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
