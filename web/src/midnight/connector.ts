// ═══════════════════════════════════════════════════════════════════════
// Vault Circle — Midnight DApp Connector wrapper
//
// The Midnight DApp Connector API is a CIP-30-style interface that wallets
// like Lace inject at `window.midnight.<walletKey>`. Lace's key is "mnLace",
// but we DO NOT hard-depend on that: we discover whichever key(s) the wallet
// actually injects, so a wallet renaming its key can't silently break us.
//
// Everything here (connect / state / disconnect) needs NO npm packages — only
// a Midnight wallet extension in the browser. The heavy @midnight-ntwrk SDK is
// only pulled in for ledger reads / circuit calls, elsewhere.
// ═══════════════════════════════════════════════════════════════════════

/** URIs the wallet is configured to talk to. Source of truth for endpoints. */
export interface ServiceUriConfig {
  readonly indexerUri: string;
  readonly indexerWsUri: string;
  readonly nodeUri: string;
  /** The proof server the wallet routes proving to (usually localhost:6300). */
  readonly proverServerUri: string;
}

/** Wallet identity + coin/encryption keys, returned by state(). */
export interface WalletState {
  readonly address: string;
  readonly coinPublicKey: string;
  readonly encryptionPublicKey?: string;
  /** Some wallet versions expose a balance map here; optional + defensive. */
  readonly balances?: Record<string, string | number | bigint>;
}

/** The enabled wallet API (returned by enable()). */
export interface DAppConnectorWalletAPI {
  state(): Promise<WalletState>;
  balanceAndProveTransaction(tx: unknown, newCoins?: unknown[]): Promise<unknown>;
  submitTransaction(tx: unknown): Promise<string>;
}

/** The injected connector object, before enabling. */
export interface DAppConnectorAPI {
  readonly apiVersion: string;
  readonly name: string;
  readonly icon?: string;
  isEnabled(): Promise<boolean>;
  enable(): Promise<DAppConnectorWalletAPI>;
  serviceUriConfig(): Promise<ServiceUriConfig>;
}

declare global {
  interface Window {
    midnight?: Record<string, DAppConnectorAPI | undefined>;
  }
}

// Preferred keys (Lace, Midnight Lace, etc.), but detection is not limited to them.
const PREFERRED_KEYS = ['mnLace', 'lace', 'midnight', 'midnightLace', 'midnightWallet'];

// Toggle verbose connector logging.
const DEBUG = true;
function log(...args: unknown[]) {
  if (DEBUG) console.info('[vault-circle/connector]', ...args);
}

/** Snapshot of what's on window.midnight — for debugging in the UI/console. */
export interface InjectionDebug {
  hasMidnight: boolean;
  keys: string[];
  chosenKey: string | null;
}

export function inspectInjection(): InjectionDebug {
  const mid = typeof window !== 'undefined' ? window.midnight : undefined;
  if (!mid) return { hasMidnight: false, keys: [], chosenKey: null };

  const keys = Object.keys(mid).filter((k) => !!mid[k]);
  // Also check non-enumerable or direct property names
  for (const k of PREFERRED_KEYS) {
    if (!keys.includes(k) && (mid as any)[k]) {
      keys.push(k);
    }
  }

  return {
    hasMidnight: true,
    keys,
    chosenKey: pickKey(keys),
  };
}

/** Choose the best available connector key: preferred first, else the first. */
function pickKey(keys: string[]): string | null {
  for (const p of PREFERRED_KEYS) if (keys.includes(p)) return p;
  return keys[0] ?? null;
}

/** Is *any* Midnight wallet connector present right now? */
export function isWalletAvailable(): boolean {
  return inspectInjection().chosenKey !== null;
}

/** Back-compat alias. */
export const isLaceAvailable = isWalletAvailable;

/**
 * Wait for a wallet connector to be injected. Extensions inject asynchronously,
 * so we poll for up to `timeoutMs`. Resolves with the connector, or null on timeout.
 */
export async function waitForConnector(timeoutMs = 4000): Promise<DAppConnectorAPI | null> {
  const started = performance.now();
  let attempt = 0;
  while (true) {
    const { keys, chosenKey } = inspectInjection();
    if (chosenKey && window.midnight?.[chosenKey]) {
      log('connector found', { key: chosenKey, keys, afterMs: Math.round(performance.now() - started) });
      return window.midnight[chosenKey]!;
    }
    if (performance.now() - started > timeoutMs) {
      log('connector NOT found before timeout', { keys, timeoutMs, attempts: attempt });
      return null;
    }
    attempt++;
    await new Promise((r) => setTimeout(r, 150));
  }
}

/** Return the injected connector immediately, or throw an actionable error. */
export function getConnector(): DAppConnectorAPI {
  const { chosenKey } = inspectInjection();
  const connector = chosenKey ? window.midnight?.[chosenKey] : undefined;
  if (!connector) {
    throw new Error(
      'No Midnight wallet detected. Please install the Midnight Lace wallet extension, ' +
        'ensure it is enabled and set to Preprod network, then try connecting again.',
    );
  }
  return connector;
}

/** Everything the UI needs after a successful connect. */
export interface ConnectionInfo {
  readonly api: DAppConnectorWalletAPI;
  readonly state: WalletState;
  readonly uris: ServiceUriConfig;
  readonly walletName: string;
  readonly apiVersion: string;
  readonly connectorKey: string;
}

/**
 * Connect: wait for injection if needed, call enable() or connect(), then read wallet state
 * + service URIs. Pure connector traffic — no proof server required.
 */
export async function connectLace(): Promise<ConnectionInfo> {
  let connector = chosenConnector();
  if (!connector) {
    connector = (await waitForConnector(3000)) ?? getConnector();
  }

  const chosenKey = inspectInjection().chosenKey ?? 'mnLace';
  log('calling enable()/connect()', { key: chosenKey, name: connector.name });

  // Support enable() (CIP-30) or connect('testnet'/'preprod')
  let api: DAppConnectorWalletAPI;
  if (typeof connector.enable === 'function') {
    api = await connector.enable();
  } else if (typeof (connector as any).connect === 'function') {
    api = await (connector as any).connect('preprod');
  } else {
    throw new Error('Wallet connector does not expose an enable() or connect() method.');
  }

  const fetchUris = typeof connector.serviceUriConfig === 'function'
    ? connector.serviceUriConfig()
    : Promise.resolve({
        indexerUri: 'https://indexer.preprod.midnight.network/api/v3/graphql',
        indexerWsUri: 'wss://indexer.preprod.midnight.network/api/v3/graphql/ws',
        nodeUri: 'wss://rpc.preprod.midnight.network',
        proverServerUri: 'http://127.0.0.1:6300',
      });

  const [state, uris] = await Promise.all([
    extractWalletState(api),
    fetchUris,
  ]);
  log('connected successfully', { address: state.address, uris });

  return {
    api,
    state,
    uris,
    walletName: connector.name || 'Midnight Lace',
    apiVersion: connector.apiVersion || '1.0.0',
    connectorKey: chosenKey,
  };
}

async function extractWalletState(api: any): Promise<WalletState> {
  log('extracting state from api', api);
  let raw: any = null;

  try {
    if (typeof api.state === 'function') {
      raw = await api.state();
    } else if (typeof api.getState === 'function') {
      raw = await api.getState();
    } else if (api.state && typeof api.state.subscribe === 'function') {
      raw = await new Promise((resolve, reject) => {
        const sub = api.state.subscribe({
          next: (v: any) => { sub.unsubscribe(); resolve(v); },
          error: (err: any) => reject(err),
        });
      });
    } else if (api.state$ && typeof api.state$.subscribe === 'function') {
      raw = await new Promise((resolve, reject) => {
        const sub = api.state$.subscribe({
          next: (v: any) => { sub.unsubscribe(); resolve(v); },
          error: (err: any) => reject(err),
        });
      });
    } else if (api.state) {
      raw = await Promise.resolve(api.state);
    } else {
      raw = api;
    }
  } catch (err) {
    log('error invoking api.state(), fallback to api object', err);
    raw = api;
  }

  log('raw wallet state:', raw);

  const address =
    typeof raw === 'string'
      ? raw
      : raw?.address ||
        raw?.bech32Address ||
        raw?.unshieldedAddress ||
        raw?.publicKeys?.coinPublicKey ||
        'connected-wallet';

  const coinPublicKey =
    raw?.coinPublicKey ||
    raw?.publicKeys?.coinPublicKey ||
    raw?.coinKey ||
    '';

  const encryptionPublicKey =
    raw?.encryptionPublicKey ||
    raw?.publicKeys?.encryptionPublicKey ||
    raw?.encryptionKey ||
    '';

  const balances = raw?.balances || raw?.balance || {};

  return {
    address,
    coinPublicKey,
    encryptionPublicKey,
    balances,
  };
}

function chosenConnector(): DAppConnectorAPI | null {
  const { chosenKey } = inspectInjection();
  return chosenKey ? (window.midnight?.[chosenKey] ?? null) : null;
}

/**
 * Whether the wallet already considers this dApp authorized (so we can restore
 * the session on reload without re-prompting).
 */
export async function isAlreadyConnected(): Promise<boolean> {
  try {
    const connector = await waitForConnector(1500);
    if (!connector) return false;
    return await connector.isEnabled();
  } catch {
    return false;
  }
}

/**
 * "Disconnect" for a CIP-30-style connector is client-side: the API has no
 * revoke() method — authorization is managed inside the wallet's own
 * "Connected dApps" UI. We drop local references; the UI surfaces how to fully
 * revoke.
 */
export const DISCONNECT_HINT =
  'Disconnected locally. To fully revoke access, open Lace → Settings → ' +
  'Connected dApps and remove this site.';
