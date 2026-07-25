// ═══════════════════════════════════════════════════════════════════════
// Vault Circle — circuit calls (WRITE, Tier C — requires proof server)
//
// This is the "call a circuit from the frontend and handle the result" path.
// Submitting a circuit generates a ZK proof, so this tier requires ALL of:
//   1. a deployed contract address (config/network CONTRACT_ADDRESS),
//   2. a running proof server (Docker, localhost:6300), and
//   3. the write-path Midnight SDK providers:
//        @midnight-ntwrk/midnight-js-http-client-proof-provider
//        @midnight-ntwrk/midnight-js-fetch-zk-config-provider
//        @midnight-ntwrk/midnight-js-level-private-state-provider
//
// The read/observe tiers (connect, privacy demo, on-chain ledger) ship and
// run without any of that. To keep the app building and running with only the
// installed packages, the write path is *gated*: callContribute() throws a
// clear, actionable error instead of importing packages that aren't present.
//
// To enable Tier C for real: install the three provider packages above, then
// swap the body of assembleWritePath() for the real midnight-js provider set
// (indexerPublicDataProvider + httpClientProofProvider + FetchZkConfigProvider
// + levelPrivateStateProvider) and findDeployedContract(...).callTx.<circuit>().
// ═══════════════════════════════════════════════════════════════════════

import { CONTRACT_ADDRESS } from '../config/network';
import type { DAppConnectorWalletAPI, WalletState } from './connector';

export interface CircuitCallResult {
  /** The circuit's return value, if any (contribute() returns a Boolean). */
  returnValue?: boolean;
  /** Transaction id/hash of the finalized submission. */
  txId: string;
}

/** Raised when the Tier-C write path is invoked but its prerequisites are absent. */
export class WritePathUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WritePathUnavailableError';
  }
}

const MISSING_DEPS = [
  '@midnight-ntwrk/midnight-js-http-client-proof-provider',
  '@midnight-ntwrk/midnight-js-fetch-zk-config-provider',
  '@midnight-ntwrk/midnight-js-level-private-state-provider',
].join(', ');

/**
 * Guard the write path. Returns void when it *could* proceed, otherwise throws
 * a WritePathUnavailableError describing exactly what's missing. Kept in one
 * place so both circuit entry points share the same precondition messaging.
 */
function assertWritePathReady(): void {
  if (CONTRACT_ADDRESS.length === 0) {
    throw new WritePathUnavailableError(
      'No contract deployed. Deploy the Vault Circle contract and set its ' +
        'address (VITE_CONTRACT_ADDRESS) before calling a circuit.',
    );
  }
  // The write-path SDK providers are optional deps and are not installed in
  // this build. We surface that plainly rather than crashing on a bad import.
  throw new WritePathUnavailableError(
    'Circuit submission (Tier C) is not enabled in this build. It requires the ' +
      'write-path providers (' +
      MISSING_DEPS +
      ') plus a running proof server. The connect, privacy-demo and on-chain ' +
      'ledger features work without them.',
  );
}

/**
 * Call contribute(): would prove (privately) that `amount >= requiredShare`,
 * disclose only the boolean, and grow the pool by the public share.
 *
 * Gated in this build — see the module header. Throws WritePathUnavailableError.
 */
export async function callContribute(
  _walletApi: DAppConnectorWalletAPI,
  _walletState: WalletState,
  _proverServerUri: string,
  _amount: bigint,
): Promise<CircuitCallResult> {
  assertWritePathReady();
  // Unreachable: assertWritePathReady always throws in this build. Kept so the
  // signature stays honest for when Tier C is enabled.
  throw new WritePathUnavailableError('unreachable');
}

/**
 * Call setRequiredShare(share): would set the public required contribution.
 *
 * Gated in this build — see the module header. Throws WritePathUnavailableError.
 */
export async function callSetRequiredShare(
  _walletApi: DAppConnectorWalletAPI,
  _walletState: WalletState,
  _proverServerUri: string,
  _share: bigint,
): Promise<CircuitCallResult> {
  assertWritePathReady();
  throw new WritePathUnavailableError('unreachable');
}
