/**
 * Check the signature of registerNightUtxosForDustGeneration
 */
import { WalletFacade } from '@midnight-ntwrk/wallet-sdk-facade';
import * as fs from 'fs';

// Check function arity
const fn = WalletFacade.prototype.registerNightUtxosForDustGeneration;
console.log(`\nFunction arity: ${fn.length} parameters`);
console.log(`\nFunction source:\n${fn.toString().slice(0, 1500)}`);

// Also check the .d.ts
const dtsPath = 'node_modules/@midnight-ntwrk/wallet-sdk-facade/dist/index.d.ts';
const dts = fs.readFileSync(dtsPath, 'utf8');
const match = dts.match(/registerNightUtxos[^;]+;/s);
if (match) {
  console.log(`\nType signature:\n${match[0]}`);
}

process.exit(0);
