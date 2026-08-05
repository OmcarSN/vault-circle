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

import deployment from '../../../deployment.preview.json';

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

// Dynamically set network and contract address based on deployment receipt
export const ACTIVE_NETWORK: NetworkId = (deployment.network as NetworkId) || 'preview';
export const ENDPOINTS: NetworkEndpoints =
  ACTIVE_NETWORK === 'preprod' ? PREPROD : PREVIEW;

// ─── Deployed contract address ─────────────────────────────────────────
export const CONTRACT_ADDRESS: string =
  (import.meta.env.VITE_VAULT_CIRCLE_ADDRESS as string | undefined)?.trim() ||
  deployment.contractAddress ||
  '';

export const hasDeployedContract = (): boolean => CONTRACT_ADDRESS.length > 0;

