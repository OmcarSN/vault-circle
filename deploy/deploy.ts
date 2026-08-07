// ═══════════════════════════════════════════════════════════════════════
// Vault Circle — Deploy the compiled Compact contract to Preprod / Preview
//
// Usage:
//   npm run deploy:preprod        (or)   npm run deploy:preview
//
// Reads the wallet seed from .env.<network> (VAULT_CIRCLE_SEED), builds and
// funds the wallet, then deploys contracts/counter.compact using the compiled
// artifacts in managed/. Prints and saves the resulting contract address.
// ═══════════════════════════════════════════════════════════════════════
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadEnv } from 'dotenv';

import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { CompiledContract } from '@midnight-ntwrk/compact-js';

// Compiled Vault Circle contract (managed/contract/index.js).
import { Contract } from '../managed/contract/index.js';

import { configForNetwork, contractConfig } from './config.js';
import { addressForSeed, buildWalletAndWaitForFunds, configureProviders } from './wallet.js';
import { describeError } from './errors.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

// ─── Private state + witness ───────────────────────────────────────────
// The Vault Circle contract has one witness: memberContribution(), returning
// the member's actual contribution amount. It is NEVER written to the ledger.
// For deployment we seed it from the env (VAULT_CIRCLE_CONTRIBUTION) or default.
const PRIVATE_STATE_ID = 'vaultCirclePrivateState';

type VaultCirclePrivateState = Record<string, never>;

// The contract's public counters are all Uint<32>, so any deploy-time amount
// must fit that range. Parsing with a bare `BigInt(...)` would throw an opaque
// SyntaxError at module load (before any logging) on a malformed value, or
// silently bake a negative/oversized number into the on-chain contract. Validate
// up front and fail with a clear, actionable message instead.
const UINT32_MAX = (1n << 32n) - 1n;

function parseUint32Env(name: string, fallback: string): bigint {
  const raw = (process.env[name] ?? fallback).trim();
  let value: bigint;
  try {
    value = BigInt(raw);
  } catch {
    throw new Error(`Invalid ${name}="${raw}". Expected a whole number in [0, ${UINT32_MAX}].`);
  }
  if (value < 0n || value > UINT32_MAX) {
    throw new Error(`Invalid ${name}=${value}. Out of Uint<32> range [0, ${UINT32_MAX}].`);
  }
  return value;
}

async function main(): Promise<void> {
  const network = (process.argv[2] ?? 'preprod').toLowerCase();

  // Load .env.<network> before reading any VAULT_CIRCLE_* variables.
  loadEnv({ path: path.resolve(currentDir, '..', `.env.${network}`) });

  const seed = process.env.VAULT_CIRCLE_SEED;
  if (!seed || !/^[0-9a-fA-F]{64}$/.test(seed.trim())) {
    throw new Error(
      `Missing or invalid VAULT_CIRCLE_SEED in .env.${network}. ` +
        `Expected a 64-character hex seed.`,
    );
  }
  const seedHex = seed.trim();

  // Parse and validate requiredShare and contributionAmount AFTER loadEnv() so
  // the values from .env.<network> are read (not just shell env + defaults).
  const requiredShare = parseUint32Env('VAULT_CIRCLE_REQUIRED_SHARE', '100');
  const contributionAmount = parseUint32Env('VAULT_CIRCLE_CONTRIBUTION', '100');

  const witnesses = {
    memberIndex(context: any): [VaultCirclePrivateState, bigint] {
      // Default member index for deployment — not used by the constructor,
      // but required by the Compact runtime to be present.
      return [context.privateState, 0n];
    },
    memberContribution(context: any): [VaultCirclePrivateState, bigint] {
      return [context.privateState, contributionAmount];
    },
  };

  const config = configForNetwork(network);

  console.log(`\n▶ Deploying Vault Circle to "${network}"`);
  console.log(`  requiredShare = ${requiredShare}`);
  console.log(`  Wallet address (funding): ${addressForSeed(seedHex)}\n`);

  // 1. Build wallet, print funding address, wait for tNight + DUST.
  let walletCtx;
  try {
    walletCtx = await buildWalletAndWaitForFunds(config, seedHex);
  } catch (err) {
    console.error('\n✗ Wallet build/sync failed — full detail:\n');
    console.error(describeError(err));
    throw err;
  }

  // 2. Configure midnight-js providers (proof server, indexer, zk config, private state).
  const providers = await configureProviders(walletCtx, config);

  // 3. Compile-bind the contract: attach witnesses + on-disk ZK assets (managed/).
  const compiled = CompiledContract.make('vault-circle', Contract).pipe(
    CompiledContract.withWitnesses(witnesses),
    CompiledContract.withCompiledFileAssets(contractConfig.zkConfigPath),
  );

  // 4. Deploy — constructor takes `reqShare`, so pass it via `args`.
  //    The dust wallet continues syncing in the background. If we get
  //    "InsufficientFunds: could not balance dust", we retry after a wait
  //    because dust coins may appear as the wallet catches up.
  const MAX_DEPLOY_ATTEMPTS = 30;
  const RETRY_WAIT_MS = 2 * 60 * 1000; // 2 minutes between retries

  for (let attempt = 1; attempt <= MAX_DEPLOY_ATTEMPTS; attempt++) {
    try {
      console.log(`\n  [Attempt ${attempt}/${MAX_DEPLOY_ATTEMPTS}] Deploying contract (generating proof)…`);
      const deployed = await deployContract(providers, {
        compiledContract: compiled,
        privateStateId: PRIVATE_STATE_ID,
        initialPrivateState: {} as VaultCirclePrivateState,
        args: [requiredShare],
      });

      const address = deployed.deployTxData.public.contractAddress;

      const DIV = '══════════════════════════════════════════════════════════════';
      console.log(`
${DIV}
  ✅ Contract deployed successfully!
${DIV}
  Network:          ${network}
  Contract address: ${address}
${DIV}
`);

      // 5. Persist the address for the README / later reference.
      const outFile = path.resolve(currentDir, '..', `deployment.${network}.json`);
      writeFileSync(
        outFile,
        JSON.stringify({ network, contractAddress: address, requiredShare: requiredShare.toString() }, null, 2) + '\n',
      );
      console.log(`  Saved deployment info to ${path.basename(outFile)}\n`);

      await walletCtx.wallet.close?.();
      process.exit(0);
    } catch (err: any) {
      const msg = String(err?.message ?? err);
      if (msg.includes('InsufficientFunds') || msg.includes('could not balance dust')) {
        console.log(`\n  ⚠ Dust not yet available (wallet still syncing). Waiting 2 min before retry…`);
        if (attempt < MAX_DEPLOY_ATTEMPTS) {
          await new Promise((r) => setTimeout(r, RETRY_WAIT_MS));
          continue;
        }
      }
      console.error('\n✗ Deploy failed:\n');
      console.error(describeError(err));
      process.exit(1);
    }
  }
}

main().catch((err) => {
  console.error('\n✗ Deploy failed:\n');
  console.error(describeError(err));
  process.exit(1);
});
