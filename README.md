# Vault Circle

> A privacy-preserving digital chit fund on Midnight.

A **rotating savings circle** (chit fund) on the Midnight blockchain. Members contribute a fixed amount each cycle into a shared pool; one member receives the payout on rotation. Contribution amounts and individual payout history stay **private** (private witnesses), while the contract publicly proves the fund stays solvent and contributions are made on schedule (public ledger state).

## Contract Address

| Network  | Address                                                   |
|----------|-----------------------------------------------------------|
| Preview  | [PASTE ADDRESS AFTER DEPLOY]                              |
| Preprod  | [PASTE ADDRESS AFTER DEPLOY]                              |

## What This Does

Vault Circle is a smart contract that manages a privacy-preserving chit fund:

- **`contribute()`** — Proves a member's contribution meets the required share without revealing their actual payment amount. The ledger only records a boolean `true` for `contributionMet`.
- **`closeCycle()`** — Closes the current cycle after a successful payout. Resets `contributionMet` and increments the cycle counter.
- **`markInsolvent()`** — Emergency circuit to mark the fund as insolvent if payouts exceed the pool.

## Privacy Model

Vault Circle leverages zero-knowledge cryptography to fix the fundamental flaw in traditional on-chain finance: **total transparency.** We ensure financial privacy for individuals while guaranteeing systemic trust for the group.

### 🔒 What stays strictly Private (Encrypted Client-Side)

| Field                 | Type      | Description                                   |
|-----------------------|-----------|-----------------------------------------------|
| `memberContribution`  | Witness   | The member's actual contribution amount       |
| `memberIndex`         | Witness   | Caller's position in the rotation (Identity Mask) |

- **Exact Contribution Amounts:** Never recorded on the ledger. Your exact capital limits and deposit sizes are encrypted on your local device.
- **Individual Payout History:** Other members cannot inspect the chain to see exactly when you claimed a payout or how much your specific claim was worth.
- **Member Identity Mapping:** The rotation sequence uses masked indexes, decoupling your Lace wallet address from your turn in the circle.

### 👁 What is Publicly Provable (On-Chain Ledger State)

| Field                 | Type      | Description                                        |
|-----------------------|-----------|----------------------------------------------------|
| `requiredShare`       | Uint<32>  | The fixed amount each member must contribute       |
| `memberCount`         | Uint<32>  | Total members in the circle                        |
| `currentRecipientIndex`| Uint<32> | Whose turn it is in the rotation (index)           |
| `membersContributedThisCycle`| Uint<32> | Count of members who've paid this cycle      |
| `poolTotal`           | Uint<32>  | Running pool total                                 |
| `cycleCount`          | Uint<32>  | Number of completed cycles                         |
| `poolSolvent`         | Boolean   | Whether the fund is solvent                        |

- **Pool Solvency:** The contract cryptographically guarantees that the collective pool has met its funding target before allowing payouts.
- **Fair Rotation:** The smart contract enforces strict turn-based claiming, ensuring no member can skip the line or claim twice.
- **Threshold Met:** Zero-knowledge proofs publicly verify that each member met the minimum required share, without revealing the actual amount deposited.

## System Architecture

```
[ Client Browser ]                             [ Midnight Network ]
       │                                              │
 ┌─────▼──────┐     Local Witness         ┌───────────▼───────────┐
 │ Lace Wallet│ ───────────────────────►  │ Public Ledger State   │
 └─────┬──────┘  (Private Deposit Amt)    │ - poolSolvent         │
       │                                  │ - poolTotal           │
       │                                  │ - memberCount         │
       │                                  │ - cycleCount          │
 ┌─────▼──────┐                           │ - recipientIndex      │
 │ UI React   │                           └───────────┬───────────┘
 │ Dashboard  │ ◄─────────────────────────────────────┤
 │ Deposit UI │       Read Public State (indexer)     │
 └─────┬──────┘                                       │
       │                                              │
 ┌─────▼──────┐     submitTx(proof)       ┌───────────▼───────────┐
 │ Proof Svr  │ ───────────────────────►  │ Compact Smart Contract│
 │ (Localhost)│                           │ - contribute()        │
 └────────────┘                           │ - claimPayout()       │
    Generates                             │ - checkSolvency()     │
    ZK Proof                              └───────────────────────┘
```

## Tech Stack

- **Smart Contract Language:** [Compact](https://docs.midnight.network/compact) v0.23
- **Runtime:** `@midnight-ntwrk/compact-runtime` 0.16.0
- **On-chain Runtime:** `@midnight-ntwrk/onchain-runtime-v3`
- **Testing:** Vitest v3
- **Zero-Knowledge:** ZKIR circuits (generated by `compact compile`)
- **Network:** Midnight Preview / Preprod
- **Proof Server:** `midnightntwrk/proof-server:7.0.0`

## Prerequisites

- Node.js v22+
- Docker
- Compact compiler v0.5.1+ (`compact --version`)
- A Midnight wallet (Lace or compatible) with testnet tNIGHT tokens

### Install the Compact Compiler

```bash
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh
```

Verify:

```bash
compact --version
```

## Setup

```bash
# Clone or navigate to the project
cd vault-circle

# Install dependencies
npm install

# Compile the Compact contract
compact compile contracts/counter.compact managed/

# Start the proof server (separate terminal)
docker run -p 6300:6300 midnightntwrk/proof-server:7.0.0
```

## Run Tests

```bash
npm test
```

Expected output:

```
 RUN  v3.2.7
 ✓ tests/counter.test.ts (13 tests) 459ms

 Test Files  1 passed (1)
      Tests  13 passed (13)
```

### Test Coverage

1. **Circuit Logic** (4 tests) — contribute accepts/rejects based on threshold
2. **State Transitions** (4 tests) — cycle lifecycle, resets, multiple cycles
3. **Privacy** (3 tests) — private amount never exposed on ledger
4. **Emergency** (2 tests) — markInsolvent works once, rejects twice

## Project Structure

```
vault-circle/
├── contracts/
│   └── counter.compact       ← Compact smart contract
├── managed/                  ← Auto-generated by compact compile
│   ├── contract/
│   ├── compiler/
│   ├── keys/                 ← Prover/verifier keys per circuit
│   └── zkir/                 ← ZKIR circuits
├── src/                      ← Frontend (added in Level 2)
├── tests/
│   └── counter.test.ts       ← 13 passing tests
├── .github/
│   └── workflows/            ← CI/CD (added in Level 3)
├── README.md
└── package.json
```

## Deploy

We have a custom deployment pipeline configured for Midnight Preprod and Preview networks.

To deploy to Midnight Preprod:

```bash
npm run deploy:preprod
```

To deploy to Midnight Preview:

```bash
npm run deploy:preview
```

*Note: The deployment script relies on a synced dust wallet. If the Midnight network's dust generation is currently stalled, the deployment will wait for sync.*

## Initial Idea

Vault Circle — a privacy-preserving digital chit fund / rotating savings circle. Members contribute a fixed amount each cycle into a shared pool; one member receives the payout on rotation. Contribution amounts and individual payout history stay private (private witness), while the contract publicly proves the fund stays solvent and contributions are made on schedule (public ledger state). `disclose()` is used only to reveal the aggregate pool total when a cycle closes — never individual amounts.

## Screenshots

*[Screenshots to be added after frontend is built in Level 2]*

---

Built for the [Midnight Builder Challenge](https://risein.com) — Level 1.
