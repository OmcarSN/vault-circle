# Vault Circle — Frontend (Level 2: Waxing Crescent)

A React + Vite + TypeScript frontend for the Vault Circle contract
([`../contracts/counter.compact`](../contracts/counter.compact)). It connects the
**Lace** wallet on Midnight Preprod, observes public ledger state, calls the
`contribute()` circuit, and demonstrates **observable privacy** — proving a
contribution meets the required share without revealing the amount.

> ⚠️ **Run all `npm` commands from a native WSL shell** (`~/vault-circle/web`),
> never from Windows against `\\wsl.localhost\...` — `npm` shells out to
> `cmd.exe`, which can't operate from a UNC path. Same rule as the root project.

---

## The three tiers (what needs what)

The app is deliberately layered so each capability has the smallest possible
set of prerequisites. This matters because Lace warns that transactions need a
**proof server** — that requirement applies to **only the third tier**.

| Tier | Capability | npm deps | Proof server | Deployed contract |
| ---- | ---------- | -------- | ------------ | ----------------- |
| **A** | Connect / disconnect Lace; the privacy demo | none (base only) | ❌ | ❌ |
| **B** | Observe on-chain ledger state | Midnight SDK (optional deps) | ❌ | ✅ (address) |
| **C** | Call `contribute()` / `setRequiredShare()` | Midnight SDK | ✅ **yes** | ✅ |

**Why the proof server is Tier C only:** connecting is pure DApp-connector
traffic, and reading ledger state is a proof-free indexer query. Only
*submitting* a circuit generates a ZK proof, which Midnight routes to the local
proof server — that is exactly the "mandatory network requirement" Lace warns
about.

---

## Quick start (Tier A — no proof server, no deploy)

```bash
cd ~/vault-circle/web
npm install          # base deps only (react, vite, typescript)
npm run dev          # http://localhost:5173
```

You get: **wallet connect/disconnect** and the **observable-privacy demo**
(fully client-side). Ledger reads and circuit calls show a clear "not
configured yet" message rather than crashing.

To connect: install the [Lace extension](https://www.lace.io/), switch it to
**Preprod**, reload, and click **Connect Lace**.

---

## Enabling Tier B + C (SDK, contract, proof server)

### 1. Install the optional Midnight SDK deps

They're listed under `"//optionalMidnightDeps"` in
[`package.json`](package.json) (kept out of the default install because they're
heavy WASM packages). Move that block into `"dependencies"` (or `npm install`
the listed packages at those pinned versions), then:

```bash
npm install
```

The Vite config auto-detects `vite-plugin-wasm` / `vite-plugin-top-level-await`
once present.

### 2. Point the app at a deployed contract

Deploy via the root project's Phase 2 pipeline (`npm run deploy:preprod`), then
either edit `CONTRACT_ADDRESS` in [`src/config/network.ts`](src/config/network.ts)
or pass it at runtime:

```bash
VITE_VAULT_CIRCLE_ADDRESS=<contract-address> npm run dev
```

Tier B (ledger observation) now works — no proof server needed.

### 3. Stage the ZK assets + start the proof server (Tier C only)

The browser prover fetches the compiled ZK keys over HTTP. Copy them into
`public/zk` (gitignored, generated from `../managed`):

```bash
npm run prep:zk
```

Then start the proof server in a **separate** terminal and leave it running:

```bash
docker run --platform linux/amd64 -p 6300:6300 midnightntwrk/proof-server:2.0.8
```

The **Contribute** panel shows a live proof-server status and re-check button;
`contribute()` is only enabled once it's reachable and a contract is configured.

---

## What each part does

```
web/
├── src/
│   ├── config/network.ts        # Preprod/Preview endpoints + contract address
│   ├── midnight/
│   │   ├── connector.ts         # Lace DApp connector (window.midnight.mnLace) — Tier A
│   │   ├── ledger.ts            # read + decode public ledger via indexer — Tier B
│   │   ├── proofServer.ts       # proof-server reachability probe
│   │   └── circuits.ts          # contribute()/setRequiredShare() call path — Tier C
│   ├── privacy/model.ts         # pure model of the disclose() boundary
│   ├── hooks/                   # useWallet, useLedger, useContribute
│   ├── components/              # WalletPanel, LedgerPanel, ContributePanel, PrivacyDemo
│   └── App.tsx
├── scripts/prepare-zk-assets.mjs
└── vite.config.ts
```

---

## Observable privacy — what we're demonstrating

The contract's `contribute()` reads a **private witness** `memberContribution()`
(the member's real amount), computes `met = amount >= requiredShare` inside a
zero-knowledge proof, and `disclose()`s **only the boolean**. The pool grows by
the **public** `requiredShare`, never by the secret.

The **Observable privacy** panel makes this checkable *without* a chain: enter
two different secret amounts that both clear the share, and watch their public
footprints (`contributionMet`, `poolTotal`, `contributionsCount`) come out
**byte-identical**. The chain learns *whether* the bar was met — the amount
stays within a ~2^63-wide range the observer can never narrow. See the design
note in [`../deploy/PRIVACY_DEMO.md`](../deploy/PRIVACY_DEMO.md) for how to
demonstrate the same property end-to-end against the live contract.

---

## Troubleshooting

- **"No wallet detected"** — Lace isn't installed, or isn't on Preprod, or the
  page loaded before the extension injected. Reload.
- **Ledger panel: "SDK not installed yet"** — you're on Tier A; install the
  optional deps (step 1) for Tier B.
- **`contribute()` disabled** — needs a connected wallet, a configured contract
  address, and a reachable proof server. The panel shows which is missing.
- **Proof server "unknown"** — the health probe can be blocked by CORS even
  when the server is up; if `docker` is running and mapped to 6300, proceed.
