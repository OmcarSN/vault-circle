import { createContext, useContext, useState, ReactNode } from 'react';
import { ACTIVE_NETWORK } from '../config/network';

interface GlobalState {
  walletStatus: 'disconnected' | 'connecting' | 'connected';
  connectedNetwork: string;
  activeCircleId: string | null;
  setWalletStatus: (status: 'disconnected' | 'connecting' | 'connected') => void;
  setConnectedNetwork: (network: string) => void;
  setActiveCircleId: (id: string | null) => void;
}

const GlobalStateContext = createContext<GlobalState | undefined>(undefined);

export function GlobalStateProvider({ children }: { children: ReactNode }) {
  const [walletStatus, setWalletStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [connectedNetwork, setConnectedNetwork] = useState<string>(ACTIVE_NETWORK);
  const [activeCircleId, setActiveCircleId] = useState<string | null>(null);

  return (
    <GlobalStateContext.Provider
      value={{
        walletStatus,
        setWalletStatus,
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
