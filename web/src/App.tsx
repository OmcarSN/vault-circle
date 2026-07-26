import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GlobalStateProvider } from './context/GlobalStateContext';
import { Layout } from './components/Layout';

// Page imports
import { LandingPage } from './pages/LandingPage';
import { CircleList } from './pages/CircleList';
import { CircleDashboard } from './pages/CircleDashboard';
import { DepositPage } from './pages/DepositPage';
import { PayoutPage } from './pages/PayoutPage';
import { WalletDiagnostics } from './pages/WalletDiagnostics';
import { PrivacyLab } from './pages/PrivacyLab';
import { About } from './pages/About';

export function App() {
  return (
    <GlobalStateProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<LandingPage />} />
            <Route path="circles" element={<CircleList />} />
            <Route path="circles/:id" element={<CircleDashboard />} />
            <Route path="circles/:id/deposit" element={<DepositPage />} />
            <Route path="circles/:id/payout" element={<PayoutPage />} />
            <Route path="wallet" element={<WalletDiagnostics />} />
            <Route path="privacy-lab" element={<PrivacyLab />} />
            <Route path="about" element={<About />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </GlobalStateProvider>
  );
}
