import { createContext, useContext, useState, ReactNode } from 'react';
import { ACTIVE_NETWORK } from '../config/network';
import { useWallet, type UseWallet } from '../hooks/useWallet';

interface GlobalState {
  wallet: UseWallet;
  connectedNetwork: string;
  activeCircleId: string | null;
  setConnectedNetwork: (network: string) => void;
  setActiveCircleId: (id: string | null) => void;
}

const GlobalStateContext = createContext<GlobalState | undefined>(undefined);

export function GlobalStateProvider({ children }: { children: ReactNode }) {
  const wallet = useWallet();
  const [connectedNetwork, setConnectedNetwork] = useState<string>(ACTIVE_NETWORK);
  const [activeCircleId, setActiveCircleId] = useState<string | null>(null);

  return (
    <GlobalStateContext.Provider
      value={{
        wallet,
        connectedNetwork,
        setConnectedNetwork,
        activeCircleId,
        setActiveCircleId,
      }}
    >
      {children}
    </GlobalStateContext.Provider>
  );
}

export function useGlobalState() {
  const context = useContext(GlobalStateContext);
  if (context === undefined) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }
  return context;
}
