// ═══════════════════════════════════════════════════════════════════════
// Vault Circle — ledger observation (READ-ONLY, no proof server)
//
// Reading public ledger state is proof-free: we ask the Midnight indexer for
// the contract's on-chain state and decode it with the contract's generated
// `ledger()` function. This needs the Midnight SDK + the compiled contract
// (both WASM-backed), so everything here is behind a lazy dynamic import —
// the app's connect/disconnect + privacy explainer still work even if these
// optional deps aren't installed yet.
//
// Tiers:
//   • connect/disconnect ....... zero deps
//   • observe ledger (this) .... SDK, NO proof server, needs deployed address
//   • submit circuit call ...... SDK + proof server + deployed address
// ═══════════════════════════════════════════════════════════════════════

import { ENDPOINTS, ACTIVE_NETWORK } from '../config/network';

/** The four public ledger fields of the Vault Circle contract. */
export interface VaultLedger {
  /** Agreed contribution per member per cycle (public). */
  requiredShare: bigint;
  /** Whether the MOST RECENT contribution met the share. */
  contributionMet: boolean;
  /** How many contributions have been recorded. */
  contributionsCount: bigint;
  /** Running pool total, accrued in units of requiredShare. */
  poolTotal: bigint;
}

export type LedgerReadError =
  | { kind: 'deps-missing'; message: string }
  | { kind: 'not-deployed'; message: string }
  | { kind: 'not-found'; message: string }
  | { kind: 'failed'; message: string };

export type LedgerReadResult =
  | { ok: true; ledger: VaultLedger }
  | { ok: false; error: LedgerReadError };

// Cache the provider across reads (creating it opens indexer connections).
let providerPromise: Promise<unknown> | null = null;

async function getPublicDataProvider(): Promise<unknown> {
  if (providerPromise) return providerPromise;
  providerPromise = (async () => {
    // Pin the network id so serialized addresses/state decode correctly.
    const { setNetworkId } = await import('@midnight-ntwrk/midnight-js-network-id');
    setNetworkId(ACTIVE_NETWORK);

    const { indexerPublicDataProvider } = await import(
      '@midnight-ntwrk/midnight-js-indexer-public-data-provider'
    );
    return indexerPublicDataProvider(ENDPOINTS.indexer, ENDPOINTS.indexerWS);
  })();
  return providerPromise;
}

/**
 * Fetch + decode the current Vault Circle ledger for a deployed contract.
 * Returns a discriminated result so the UI can distinguish "SDK not installed"
 * from "contract not deployed" from "genuine read error".
 */
export async function readLedger(address: string): Promise<LedgerReadResult> {
  if (!address) {
    return {
      ok: false,
      error: {
        kind: 'not-deployed',
        message:
          'No contract address configured. Deploy the contract (Phase 2) or ' +
          'pass VITE_VAULT_CIRCLE_ADDRESS to observe a live ledger.',
      },
    };
  }

  // 1. Load provider + decoder (this is where missing optional deps surface).
  let provider: any;
  let ledgerDecode: (data: unknown) => VaultLedger;
  try {
    provider = await getPublicDataProvider();
    // The generated decoder lives with the compiled contract (../../managed).
    let contractModule: any;
    try {
      contractModule = await import('../../../managed/contract/index.js');
    } catch {
      contractModule = await import('../../../managed/counter/contract/index.js');
    }
    ledgerDecode = contractModule.ledger as (d: unknown) => VaultLedger;
  } catch (e) {
    return {
      ok: false,
      error: {
        kind: 'deps-missing',
        message:
          'Midnight SDK not installed yet — install the optional deps in ' +
          'web/package.json to read live ledger state. ' +
          `(${e instanceof Error ? e.message : String(e)})`,
      },
    };
  }

  // 2. Query + decode.
  try {
    const state = await provider.queryContractState(address);
    if (!state) {
      return {
        ok: false,
        error: {
          kind: 'not-found',
          message: `No contract state found at ${address} on ${ACTIVE_NETWORK}.`,
        },
      };
    }
    const decoded = ledgerDecode(state.data);
    return {
      ok: true,
      ledger: {
        requiredShare: BigInt(decoded.requiredShare),
        contributionMet: Boolean(decoded.contributionMet),
        contributionsCount: BigInt(decoded.contributionsCount),
        poolTotal: BigInt(decoded.poolTotal),
      },
    };
  } catch (e) {
    return {
      ok: false,
      error: {
        kind: 'failed',
        message: e instanceof Error ? e.message : String(e),
      },
    };
  }
}
