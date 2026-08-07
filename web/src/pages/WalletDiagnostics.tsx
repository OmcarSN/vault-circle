import { useGlobalState } from '../context/GlobalStateContext';
import { WalletPanel } from '../components/WalletPanel';
import { PageHeader } from '../components/PageHeader';

export function WalletDiagnostics() {
  const { wallet } = useGlobalState();
  return (
    <div className="page-container">
      <PageHeader
        eyebrow="Diagnostics"
        title="Wallet Diagnostics"
        subtitle="Detailed view of your connection to the Midnight network and the Lace extension."
      />
      <WalletPanel wallet={wallet} />
    </div>
  );
}
