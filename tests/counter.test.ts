// ═══════════════════════════════════════════════════════════════════════
// Vault Circle — Multi-Member ROSCA Tests
// ═══════════════════════════════════════════════════════════════════════
//
// Tests covering:
//   1. Joining the circle
//   2. Contributing to the pool
//   3. Rotation status checks
//   4. Claiming payouts and advancing rotation
//   5. Solvency verification
//
// ═══════════════════════════════════════════════════════════════════════

import { describe, it, expect, beforeEach } from 'vitest';
import { Contract, ledger } from '../managed/contract/index.js';
import {
  emptyZswapLocalState,
  createCircuitContext
} from '@midnight-ntwrk/compact-runtime';
import {
  signatureVerifyingKey,
  sampleSigningKey,
  dummyContractAddress
} from '@midnight-ntwrk/onchain-runtime-v3';

// ─── Test Key (valid hex-encoded coinPublicKey) ─────────────────────────
const TEST_COIN_PUBLIC_KEY = signatureVerifyingKey(sampleSigningKey());

// ─── Configurable Witnesses ──────────────────────────────────────────────
let witnessContributionAmount = 100n;
let witnessMemberIndex = 0n;

const witnesses = {
  memberContribution: (_ctx: any): [any, bigint] => {
    return [_ctx.privateState, witnessContributionAmount];
  },
  memberIndex: (_ctx: any): [any, bigint] => {
    return [_ctx.privateState, witnessMemberIndex];
  }
};

// ─── Helper: Create Initial Contract + CircuitContext ──────────────────
function setupInitialState(requiredShare: bigint) {
  const contract = new Contract(witnesses);

  const constructorResult = contract.initialState(
    {
      initialPrivateState: {},
      initialZswapLocalState: emptyZswapLocalState(TEST_COIN_PUBLIC_KEY)
    },
    requiredShare
  );

  const context = createCircuitContext(
    dummyContractAddress(),
    constructorResult.currentZswapLocalState.coinPublicKey,
    constructorResult.currentContractState,
    constructorResult.currentPrivateState
  );

  return { contract, context };
}

// ─── Helper: Read Ledger State from CircuitContext ─────────────────────
function readState(ctx: any) {
  return ledger(ctx.currentQueryContext.state);
}

// ═══════════════════════════════════════════════════════════════════════
// TEST SUITES
// ═══════════════════════════════════════════════════════════════════════

describe('Vault Circle ROSCA — Lifecycle', () => {
  beforeEach(() => {
    witnessContributionAmount = 100n;
    witnessMemberIndex = 0n;
  });

  it('initializes with zeroed counters and specified share', () => {
    const { contract, context } = setupInitialState(100n);
    const state = readState(context);
    expect(state.requiredShare).toBe(100n);
    expect(state.memberCount).toBe(0n);
    expect(state.currentRecipientIndex).toBe(0n);
    expect(state.poolTotal).toBe(0n);
    expect(state.membersContributedThisCycle).toBe(0n);
    expect(state.cycleCount).toBe(0n);
    expect(state.poolSolvent).toBe(true);
  });

  it('allows members to join and increments memberCount', () => {
    const { contract, context } = setupInitialState(100n);
    
    // Member 1 joins
    const r1 = contract.impureCircuits.joinCircle(context);
    expect(readState(r1.context).memberCount).toBe(1n);
    
    // Member 2 joins
    const r2 = contract.impureCircuits.joinCircle(r1.context);
    expect(readState(r2.context).memberCount).toBe(2n);
  });

  it('processes contributions and updates pool and count', () => {
    const { contract, context } = setupInitialState(50n);
    let currentCtx = context;

    // Join 2 members
    currentCtx = contract.impureCircuits.joinCircle(currentCtx).context;
    currentCtx = contract.impureCircuits.joinCircle(currentCtx).context;

    witnessContributionAmount = 50n;
    currentCtx = contract.impureCircuits.contribute(currentCtx).context;
    
    let state = readState(currentCtx);
    expect(state.membersContributedThisCycle).toBe(1n);
    expect(state.poolTotal).toBe(50n);

    // Another contribution
    witnessContributionAmount = 100n; // overpay, pool still increments by requiredShare (50)
    currentCtx = contract.impureCircuits.contribute(currentCtx).context;

    state = readState(currentCtx);
    expect(state.membersContributedThisCycle).toBe(2n);
    expect(state.poolTotal).toBe(100n);
  });

  it('rejects underfunded contributions', () => {
    const { contract, context } = setupInitialState(100n);
    witnessContributionAmount = 90n;
    expect(() => {
      contract.impureCircuits.contribute(context);
    }).toThrow('Contribution does not meet the required share');
  });

  it('verifies rotation status correctly', () => {
    const { contract, context } = setupInitialState(100n);
    
    // State has currentRecipientIndex = 0
    witnessMemberIndex = 0n;
    let res = contract.impureCircuits.getRotationStatus(context);
    expect(res.result).toBe(true);

    witnessMemberIndex = 1n;
    res = contract.impureCircuits.getRotationStatus(context);
    expect(res.result).toBe(false);
  });

  it('handles claimPayout correctly and advances rotation', () => {
    const { contract, context } = setupInitialState(100n);
    let currentCtx = context;

    // Setup: 2 members, both contributed
    currentCtx = contract.impureCircuits.joinCircle(currentCtx).context;
    currentCtx = contract.impureCircuits.joinCircle(currentCtx).context;
    
    witnessContributionAmount = 100n;
    currentCtx = contract.impureCircuits.contribute(currentCtx).context;
    currentCtx = contract.impureCircuits.contribute(currentCtx).context;

    // Verify initial pool total is 200
    expect(readState(currentCtx).poolTotal).toBe(200n);

    // Claim payout as member 0
    witnessMemberIndex = 0n;
    currentCtx = contract.impureCircuits.claimPayout(currentCtx).context;

    const state = readState(currentCtx);
    expect(state.cycleCount).toBe(1n); // cycle incremented
    expect(state.currentRecipientIndex).toBe(1n); // rotation advanced
    expect(state.poolTotal).toBe(0n); // pool emptied
    expect(state.membersContributedThisCycle).toBe(0n); // reset
  });

  it('wraps rotation correctly when claiming at the end of a cycle epoch', () => {
    const { contract, context } = setupInitialState(100n);
    let currentCtx = context;

    // Add 1 member
    currentCtx = contract.impureCircuits.joinCircle(currentCtx).context;
    // currentRecipientIndex = 0, memberCount = 1

    // The sole member must fund the cycle before the payout can be claimed.
    witnessContributionAmount = 100n;
    currentCtx = contract.impureCircuits.contribute(currentCtx).context;

    witnessMemberIndex = 0n;
    currentCtx = contract.impureCircuits.claimPayout(currentCtx).context;

    // Should wrap back to 0
    expect(readState(currentCtx).currentRecipientIndex).toBe(0n);
  });

  it('rejects claimPayout if caller is not the current recipient', () => {
    const { contract, context } = setupInitialState(100n);
    // recipient is 0, caller is 1
    witnessMemberIndex = 1n;
    expect(() => {
      contract.impureCircuits.claimPayout(context);
    }).toThrow('Not your turn to claim the payout');
  });

  it('checks solvency correctly', () => {
    const { contract, context } = setupInitialState(100n);
    let currentCtx = context;

    // 2 members = required pool is 200
    currentCtx = contract.impureCircuits.joinCircle(currentCtx).context;
    currentCtx = contract.impureCircuits.joinCircle(currentCtx).context;

    // Pool = 0, Solvency check should fail
    expect(() => {
      contract.impureCircuits.checkSolvency(currentCtx);
    }).toThrow('Pool is underfunded');

    // Add 100 to pool -> Pool = 100, still fails
    witnessContributionAmount = 100n;
    currentCtx = contract.impureCircuits.contribute(currentCtx).context;
    expect(() => {
      contract.impureCircuits.checkSolvency(currentCtx);
    }).toThrow('Pool is underfunded');

    // Add another 100 -> Pool = 200, succeeds
    currentCtx = contract.impureCircuits.contribute(currentCtx).context;
    expect(() => contract.impureCircuits.checkSolvency(currentCtx)).not.toThrow();
  });

  it('marks insolvent via emergency circuit', () => {
    const { contract, context } = setupInitialState(100n);
    const r1 = contract.impureCircuits.markInsolvent(context);
    expect(readState(r1.context).poolSolvent).toBe(false);

    expect(() => {
      contract.impureCircuits.markInsolvent(r1.context);
    }).toThrow('Fund is already marked insolvent');
  });
});

// ═══════════════════════════════════════════════════════════════════════
// SECURITY HARDENING — regression coverage for the four fixed loopholes
// ═══════════════════════════════════════════════════════════════════════
describe('Vault Circle ROSCA — Security invariants', () => {
  beforeEach(() => {
    witnessContributionAmount = 100n;
    witnessMemberIndex = 0n;
  });

  // Fix #2: an insolvent fund must not keep accepting money.
  it('freezes contributions once the fund is marked insolvent', () => {
    const { contract, context } = setupInitialState(100n);
    let currentCtx = context;

    currentCtx = contract.impureCircuits.joinCircle(currentCtx).context;
    currentCtx = contract.impureCircuits.markInsolvent(currentCtx).context;

    witnessContributionAmount = 100n;
    expect(() => {
      contract.impureCircuits.contribute(currentCtx);
    }).toThrow('Fund is marked insolvent; contributions are frozen');
  });

  // Fix #2: an insolvent fund must not pay out.
  it('freezes payouts once the fund is marked insolvent', () => {
    const { contract, context } = setupInitialState(100n);
    let currentCtx = context;

    currentCtx = contract.impureCircuits.joinCircle(currentCtx).context;
    witnessContributionAmount = 100n;
    currentCtx = contract.impureCircuits.contribute(currentCtx).context;

    // Freeze after funding but before the claim.
    currentCtx = contract.impureCircuits.markInsolvent(currentCtx).context;

    witnessMemberIndex = 0n;
    expect(() => {
      contract.impureCircuits.claimPayout(currentCtx);
    }).toThrow('Fund is marked insolvent; payouts are frozen');
  });

  // Fix #3: a member (or non-member) cannot pad the pool with repeat deposits.
  it('caps contributions at one per member per cycle', () => {
    const { contract, context } = setupInitialState(100n);
    let currentCtx = context;

    // Single member, single allowed contribution.
    currentCtx = contract.impureCircuits.joinCircle(currentCtx).context;
    witnessContributionAmount = 100n;
    currentCtx = contract.impureCircuits.contribute(currentCtx).context;
    expect(readState(currentCtx).membersContributedThisCycle).toBe(1n);

    // Second deposit in the same cycle is rejected.
    expect(() => {
      contract.impureCircuits.contribute(currentCtx);
    }).toThrow('All members have already contributed this cycle');
  });

  // Fix #1: the recipient cannot drain the pool before the cycle is fully funded.
  it('rejects a payout claim before all members have contributed', () => {
    const { contract, context } = setupInitialState(100n);
    let currentCtx = context;

    // Two members join, but only one funds the cycle.
    currentCtx = contract.impureCircuits.joinCircle(currentCtx).context;
    currentCtx = contract.impureCircuits.joinCircle(currentCtx).context;
    witnessContributionAmount = 100n;
    currentCtx = contract.impureCircuits.contribute(currentCtx).context;

    witnessMemberIndex = 0n;
    expect(() => {
      contract.impureCircuits.claimPayout(currentCtx);
    }).toThrow('Not all members have contributed this cycle');
  });

  // Fix #4: claiming against an empty circle must not wedge the rotation.
  it('rejects a payout claim when the circle has zero members', () => {
    const { contract, context } = setupInitialState(100n);
    // No one has joined: memberCount = 0, currentRecipientIndex = 0.
    witnessMemberIndex = 0n;
    expect(() => {
      contract.impureCircuits.claimPayout(context);
    }).toThrow('Cannot claim payout with zero members');
  });
});
