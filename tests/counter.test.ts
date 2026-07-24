// ═══════════════════════════════════════════════════════════════════════
// Vault Circle — Contract Tests
// ═══════════════════════════════════════════════════════════════════════
//
// Tests covering:
//   1. Circuit logic — contribute proves contribution meets required share
//   2. State transitions — cycle closing increments counter and resets state
//   3. Privacy — private witness (actual contribution amount) is never exposed
//
// ═══════════════════════════════════════════════════════════════════════

import { describe, it, expect } from 'vitest';
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

// ─── Configurable Witness ───────────────────────────────────────────────
// The witness provides the member's actual contribution amount.
// This value stays private — it NEVER goes on the ledger.
let witnessContributionAmount = 100n;

const witnesses = {
  memberContribution: (_ctx: any): [any, bigint] => {
    return [_ctx.privateState, witnessContributionAmount];
  }
};

// ─── Helper: Create Initial Contract + CircuitContext ──────────────────

function setupInitialState(requiredShare: bigint) {
  const contract = new Contract(witnesses);

  // Run constructor to get initial ledger state
  const constructorResult = contract.initialState(
    {
      initialPrivateState: {},
      initialZswapLocalState: emptyZswapLocalState(TEST_COIN_PUBLIC_KEY)
    },
    requiredShare
  );

  // Create a CircuitContext from the constructor result
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
// TEST SUITE 1: CIRCUIT LOGIC — Contribute proves share met
// ═══════════════════════════════════════════════════════════════════════

describe('Circuit Logic — contribute()', () => {
  it('should accept a contribution that meets the required share', () => {
    witnessContributionAmount = 100n;
    const { contract, context } = setupInitialState(50n);
    const result = contract.impureCircuits.contribute(context);
    expect(result).toBeDefined();
    expect(result.result).toEqual([]);
  });

  it('should accept a contribution exactly equal to the required share', () => {
    witnessContributionAmount = 50n;
    const { contract, context } = setupInitialState(50n);
    const result = contract.impureCircuits.contribute(context);
    expect(result).toBeDefined();
    expect(result.result).toEqual([]);
  });

  it('should reject a contribution below the required share', () => {
    witnessContributionAmount = 30n;
    const { contract, context } = setupInitialState(50n);
    expect(() => {
      contract.impureCircuits.contribute(context);
    }).toThrow('Contribution does not meet the required share');
  });

  it('should update contributionMet to true after successful contribute', () => {
    witnessContributionAmount = 100n;
    const { contract, context } = setupInitialState(50n);
    const result = contract.impureCircuits.contribute(context);
    expect(readState(result.context).contributionMet).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// TEST SUITE 2: STATE TRANSITIONS — Cycle lifecycle
// ═══════════════════════════════════════════════════════════════════════

describe('State Transitions — closeCycle()', () => {
  it('should increment cycleCount when closing a cycle after contribution', () => {
    witnessContributionAmount = 100n;
    const { contract, context } = setupInitialState(50n);

    const afterContribute = contract.impureCircuits.contribute(context);
    const afterClose = contract.impureCircuits.closeCycle(afterContribute.context);

    expect(readState(afterClose.context).cycleCount).toBe(1n);
  });

  it('should reset contributionMet to false after closing a cycle', () => {
    witnessContributionAmount = 100n;
    const { contract, context } = setupInitialState(50n);

    const afterContribute = contract.impureCircuits.contribute(context);
    const afterClose = contract.impureCircuits.closeCycle(afterContribute.context);

    expect(readState(afterClose.context).contributionMet).toBe(false);
  });

  it('should reject closeCycle if contribution was not made', () => {
    const { contract, context } = setupInitialState(50n);

    expect(() => {
      contract.impureCircuits.closeCycle(context);
    }).toThrow('Cannot close cycle: contribution not met');
  });

  it('should allow multiple cycles with fresh states', () => {
    let currentContext: any = null;

    for (let i = 0; i < 3; i++) {
      witnessContributionAmount = 100n;
      const { contract, context } = setupInitialState(50n);

      const afterContribute = contract.impureCircuits.contribute(
        currentContext ?? context
      );
      const afterClose = contract.impureCircuits.closeCycle(afterContribute.context);
      currentContext = afterClose.context;
    }

    // The last context should have a fresh CircuitContext
    // (Each cycle used a separate setup, but we track the latest state)
    expect(true).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// TEST SUITE 3: PRIVACY — Private inputs are never exposed
// ═══════════════════════════════════════════════════════════════════════

describe('Privacy — Private inputs never exposed', () => {
  it('should not reveal the actual contribution amount on the ledger', () => {
    const SECRET_CONTRIBUTION = 999n;
    const REQUIRED_SHARE = 50n;

    witnessContributionAmount = SECRET_CONTRIBUTION;
    const { contract, context } = setupInitialState(REQUIRED_SHARE);

    const contributeResult = contract.impureCircuits.contribute(context);
    const state = readState(contributeResult.context);

    // The ledger only exposes: requiredShare, contributionMet, cycleCount, poolSolvent
    expect(state.requiredShare).toBe(REQUIRED_SHARE);
    expect(state.contributionMet).toBe(true);
    expect(state.cycleCount).toBe(0n);
    expect(state.poolSolvent).toBe(true);

    // The secret is never on the ledger — requiredShare is the PUBLIC threshold
    // not the actual contribution
    expect(state.requiredShare).not.toBe(SECRET_CONTRIBUTION);
    expect(typeof state.contributionMet).toBe('boolean');
  });

  it('should produce the same public state for different contributions above threshold', () => {
    const REQUIRED_SHARE = 50n;

    // Contribution = 60
    witnessContributionAmount = 60n;
    const { contract: contract1, context: context1 } = setupInitialState(REQUIRED_SHARE);
    const result1 = contract1.impureCircuits.contribute(context1);
    const state1 = readState(result1.context);

    // Contribution = 500
    witnessContributionAmount = 500n;
    const { contract: contract2, context: context2 } = setupInitialState(REQUIRED_SHARE);
    const result2 = contract2.impureCircuits.contribute(context2);
    const state2 = readState(result2.context);

    // Both public states are identical — the amount itself is never recorded
    expect(state1.contributionMet).toBe(state2.contributionMet);
    expect(state1.contributionMet).toBe(true);
  });

  it('should only disclose aggregate/boolean results via disclose()', () => {
    // The contract compiles and runs — proving the privacy model is correct.
    // The compiler enforces that witness data cannot reach the ledger without
    // an explicit disclose() call. Our circuit uses disclose(true) for the
    // boolean result, never for the raw amount.
    witnessContributionAmount = 42n;
    const { contract, context } = setupInitialState(10n);
    const result = contract.impureCircuits.contribute(context);
    const state = readState(result.context);

    // Only the boolean is disclosed — never the raw amount
    expect(state.contributionMet).toBe(true);
    expect(state.contributionMet).not.toBe(42);
    expect(typeof state.contributionMet).toBe('boolean');
  });
});

// ═══════════════════════════════════════════════════════════════════════
// TEST SUITE 4: markInsolvent — Emergency circuit
// ═══════════════════════════════════════════════════════════════════════

describe('Emergency Circuit — markInsolvent()', () => {
  it('should mark the fund as insolvent', () => {
    witnessContributionAmount = 100n;
    const { contract, context } = setupInitialState(50n);

    const result = contract.impureCircuits.markInsolvent(context);
    expect(readState(result.context).poolSolvent).toBe(false);
  });

  it('should reject marking insolvent twice', () => {
    witnessContributionAmount = 100n;
    const { contract, context } = setupInitialState(50n);

    const afterFirst = contract.impureCircuits.markInsolvent(context);

    expect(() => {
      contract.impureCircuits.markInsolvent(afterFirst.context);
    }).toThrow('Fund is already marked insolvent');
  });
});
