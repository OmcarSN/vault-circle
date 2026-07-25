// ═══════════════════════════════════════════════════════════════════════
// Vault Circle — privacy boundary model (pure, client-side)
//
// A faithful, dependency-free mirror of what contracts/counter.compact does
// at the private→public boundary. This is NOT a re-implementation of the ZK
// proof; it is a model of *what is disclosed vs. what stays private*, so the
// UI can show — without needing a wallet, proof server, or chain — that two
// different secret amounts produce the identical public footprint.
//
// Source of truth (contracts/counter.compact):
//   export circuit contribute(): Boolean {
//     const amount = memberContribution();     // PRIVATE witness
//     const met = amount >= requiredShare;      // compared in zero knowledge
//     contributionMet = disclose(met);          // only the BOOLEAN crosses
//     poolTotal = (poolTotal + requiredShare);  // grows by the PUBLIC share
//     contributionsCount.increment(1);
//     return disclose(met);
//   }
// ═══════════════════════════════════════════════════════════════════════

/** A member's private inputs — what their wallet holds, never sent on-chain. */
export interface PrivateInputs {
  /** memberContribution() — the secret amount. */
  amount: bigint;
}

/** Prior public ledger state, before this contribution. */
export interface PublicStateBefore {
  requiredShare: bigint;
  contributionsCount: bigint;
  poolTotal: bigint;
}

/** Exactly what the chain observes after contribute(). Nothing else leaks. */
export interface Disclosed {
  /** The single disclosed bit: did amount >= requiredShare? */
  contributionMet: boolean;
  /** Pool after: grows by the PUBLIC share, independent of the secret. */
  poolTotal: bigint;
  /** Count after. */
  contributionsCount: bigint;
}

export interface ContributeOutcome {
  /** What everyone can see on-chain. */
  disclosed: Disclosed;
  /** The circuit's return value (also just the disclosed boolean). */
  returned: boolean;
}

/**
 * Model one contribute() call. Given a secret `amount` and the prior public
 * state, compute exactly what gets disclosed. The amount influences ONLY the
 * boolean `met` — never any on-chain magnitude.
 */
export function modelContribute(
  priv: PrivateInputs,
  before: PublicStateBefore,
): ContributeOutcome {
  const met = priv.amount >= before.requiredShare; // compared in ZK
  return {
    disclosed: {
      contributionMet: met, // disclose(met) — the only value derived from the secret
      poolTotal: before.poolTotal + before.requiredShare, // public share, not the secret
      contributionsCount: before.contributionsCount + 1n,
    },
    returned: met,
  };
}

/**
 * Serialize the disclosed footprint to a canonical string. Two contributions
 * with this same string are indistinguishable on-chain — the basis for the
 * demo's "different secret, identical public state" claim.
 */
export function disclosedFingerprint(d: Disclosed): string {
  return JSON.stringify({
    contributionMet: d.contributionMet,
    poolTotal: d.poolTotal.toString(),
    contributionsCount: d.contributionsCount.toString(),
  });
}

/** What a curious observer can infer about the secret amount from `met`. */
export function inferredRange(
  met: boolean,
  requiredShare: bigint,
): { low: bigint | null; high: bigint | null; text: string } {
  const MAX = 18446744073709551615n; // Uint<64> max
  return met
    ? {
        low: requiredShare,
        high: MAX,
        text: `somewhere in [${requiredShare}, 2^64−1] — anything ≥ the share`,
      }
    : {
        low: 0n,
        high: requiredShare - 1n,
        text: `somewhere in [0, ${requiredShare - 1n}] — anything < the share`,
      };
}
