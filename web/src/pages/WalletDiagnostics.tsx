import { useGlobalState } from '../context/GlobalStateContext';
import { WalletPanel } from '../components/WalletPanel';

export function WalletDiagnostics() { 
  const { wallet } = useGlobalState();
  return (
    <div className="page-container">
      <h1>Wallet Diagnostics</h1>
      <p style={{ opacity: 0.8, marginBottom: '2rem' }}>Detailed view of your connection to the Midnight network and Lace extension.</p>
      <WalletPanel wallet={wallet} />
    </div>
  );
}
