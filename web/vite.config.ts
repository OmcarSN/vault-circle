import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// ═══════════════════════════════════════════════════════════════════════
// Vault Circle frontend — Vite config
//
// Two things worth knowing:
//
// 1. WASM + top-level-await:
//    The Midnight contract runtime (@midnight-ntwrk/compact-runtime and its
//    onchain-runtime dependency) ships as WebAssembly and uses top-level
//    await. Those plugins are only needed once you install the optional
//    Midnight deps for the circuit-CALL path. They are imported lazily below
//    so the dev server still boots (for connect + observe) before you've
//    installed them — see the try/catch.
//
// 2. `global` / Buffer:
//    Some Midnight packages expect Node globals in the browser. We shim
//    `global` here and polyfill Buffer in src/main.tsx.
// ═══════════════════════════════════════════════════════════════════════

// Load the WASM / top-level-await plugins only if present, so the project
// installs and runs in two stages (light first, heavy later).
async function optionalWasmPlugins() {
  try {
    const wasm = (await import('vite-plugin-wasm')).default;
    const tla = (await import('vite-plugin-top-level-await')).default;
    return [wasm(), tla()];
  } catch {
    console.warn(
      '[vite] vite-plugin-wasm / vite-plugin-top-level-await not installed yet — ' +
        'wallet connect + ledger observation still work; install the optional ' +
        'Midnight deps before testing an on-chain contribute(). See web/README.md.',
    );
    return [];
  }
}

// Async config so we can conditionally include the optional plugins without a
// top-level await (which would itself require the tla plugin to be present).
export default defineConfig(async () => ({
  plugins: [react(), ...(await optionalWasmPlugins())],
  resolve: {
    alias: {
      // The compiled contract lives in ../managed (outside web/) and imports
      // '@midnight-ntwrk/compact-runtime' as a bare specifier. Node/Rollup
      // resolves bare imports from the *importer's* folder upward, so on a
      // web-only install (e.g. Vercel) the package — which lives in
      // web/node_modules — isn't found from managed/. Pin it explicitly to
      // web's copy so resolution succeeds regardless of the importer location.
      '@midnight-ntwrk/compact-runtime': fileURLToPath(
        new URL('./node_modules/@midnight-ntwrk/compact-runtime', import.meta.url),
      ),
    },
  },
  define: {
    // A few Midnight deps reference `global` (a Node-ism) at module scope.
    global: 'globalThis',
  },
  server: {
    port: 5173,
    // Allow importing the compiled contract from ../managed (outside web/).
    fs: { allow: ['..'] },
  },
  optimizeDeps: {
    // WASM-bearing packages don't pre-bundle cleanly; let Vite handle them
    // as real ESM at runtime. Harmless if the packages aren't installed.
    exclude: [
      '@midnight-ntwrk/compact-runtime',
      '@midnight-ntwrk/midnight-js-contracts',
    ],
  },
}));
