import { useWallet } from './hooks/useWallet';
import { useLedger } from './hooks/useLedger';
import { useContribute } from './hooks/useContribute';
import { WalletPanel } from './components/WalletPanel';
import { LedgerPanel } from './components/LedgerPanel';
import { ContributePanel } from './components/ContributePanel';
import { PrivacyDemo } from './components/PrivacyDemo';
import { ACTIVE_NETWORK } from './config/network';

export function App() {
  const wallet = useWallet();
  const ledger = useLedger();
  const call = useContribute();

  return (
    <div className="app">
      <header className="hero">
        <div className="brand">
          <div className="logo">🌒</div>
          <div>
            <h1>Vault Circle</h1>
            <p className="tagline" style={{ marginTop: 4 }}>
              A privacy-preserving savings circle (ROSCA) on Midnight —{' '}
              <span className="moon">Level 2: Waxing Crescent</span>
            </p>
          </div>
        </div>
        <p className="tagline">
          Prove <em>“I met the share”</em> without revealing <em>how much</em>.
        </p>
        <div className="net-chip">
          <span className="dot" /> Network: <code>{ACTIVE_NETWORK}</code>
        </div>
      </header>

      <WalletPanel wallet={wallet} />
      <LedgerPanel ledger={ledger} />
      <ContributePanel wallet={wallet} call={call} ledger={ledger} />
      <PrivacyDemo />

      <footer>
        <span className="grad">Vault Circle</span> · Midnight Preprod ·
        privacy by zero-knowledge
      </footer>
    </div>
  );
}
