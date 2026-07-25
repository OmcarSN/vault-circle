// ═══════════════════════════════════════════════════════════════════════
// Vault Circle — network configuration
//
// Mirrors deploy/config.ts (PreprodConfig) so the frontend and the deploy
// pipeline agree on endpoints. These are the *fallback* endpoints; when a
// wallet is connected we prefer the URIs the wallet itself reports via the
// DApp connector's serviceUriConfig() (see midnight/connector.ts), because
// that is the source of truth for which node/indexer/proof-server the user's
// Lace is actually pointed at.
// ═══════════════════════════════════════════════════════════════════════

export type NetworkId = 'preprod' | 'preview';

export interface NetworkEndpoints {
  readonly indexer: string;
  readonly indexerWS: string;
  readonly node: string;
  /** Local Docker proof server — required only to SUBMIT a circuit call. */
  readonly proofServer: string;
}

export const PREPROD: NetworkEndpoints = {
  indexer: 'https://indexer.preprod.midnight.network/api/v3/graphql',
  indexerWS: 'wss://indexer.preprod.midnight.network/api/v3/graphql/ws',
  node: 'https://rpc.preprod.midnight.network',
  proofServer: 'http://127.0.0.1:6300',
};

export const PREVIEW: NetworkEndpoints = {
  indexer: 'https://indexer.preview.midnight.network/api/v3/graphql',
  indexerWS: 'wss://indexer.preview.midnight.network/api/v3/graphql/ws',
  node: 'https://rpc.preview.midnight.network',
  proofServer: 'http://127.0.0.1:6300',
};

// Vault Circle targets Preprod (where the Lace wallet is funded with tNight).
export const ACTIVE_NETWORK: NetworkId = 'preprod';
export const ENDPOINTS: NetworkEndpoints =
  ACTIVE_NETWORK === 'preprod' ? PREPROD : PREVIEW;

// ─── Deployed contract address ─────────────────────────────────────────
// Filled in once `npm run deploy:preprod` (Phase 2) writes
// deployment.preprod.json. Until then the frontend runs in "observe demo"
// mode: connect + privacy explainer work; live ledger reads and circuit
// calls are disabled with a clear message rather than crashing.
//
// You can also override at runtime without a rebuild:
//   VITE_VAULT_CIRCLE_ADDRESS=<addr> npm run dev
export const CONTRACT_ADDRESS: string =
  (import.meta.env.VITE_VAULT_CIRCLE_ADDRESS as string | undefined)?.trim() || '';

export const hasDeployedContract = (): boolean => CONTRACT_ADDRESS.length > 0;
