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

const contributionAmount = BigInt(process.env.VAULT_CIRCLE_CONTRIBUTION ?? '100');

const witnesses = {
  memberContribution(context: any): [VaultCirclePrivateState, bigint] {
    return [context.privateState, contributionAmount];
  },
};

// Required share per member per cycle — the public constructor argument.
const requiredShare = BigInt(process.env.VAULT_CIRCLE_REQUIRED_SHARE ?? '100');

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
  console.log('\n  Deploying contract (generating proof — this can take a minute)…');
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
}

main().catch((err) => {
  console.error('\n✗ Deploy failed:\n');
  console.error(describeError(err));
  process.exit(1);
});
