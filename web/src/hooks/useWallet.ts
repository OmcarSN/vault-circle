import { useCallback, useEffect, useState } from 'react';
import {
  connectLace,
  isAlreadyConnected,
  waitForConnector,
  inspectInjection,
  DISCONNECT_HINT,
  type ConnectionInfo,
  type InjectionDebug,
} from '../midnight/connector';

// ═══════════════════════════════════════════════════════════════════════
// useWallet — React state machine around the Midnight DApp connector.
//
// Status lifecycle:
//   detecting   → looking for an injected wallet (initial)
//   unavailable → no wallet connector injected within the timeout
//   idle        → wallet present, not connected
//   connecting  → enable() in flight (approval dialog is open)
//   connected   → we have wallet state + service URIs
//   error       → last connect attempt failed (message in `error`)
//
// Connect/disconnect here touch ONLY the connector — no proof server, no SDK.
// ═══════════════════════════════════════════════════════════════════════

export type WalletStatus =
  | 'detecting'
  | 'unavailable'
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'error';

export interface UseWallet {
  status: WalletStatus;
  connection: ConnectionInfo | null;
  error: string | null;
  hint: string | null;
  /** Snapshot of window.midnight for the debug panel. */
  injection: InjectionDebug;
  connect: () => Promise<void>;
  disconnect: () => void;
  /** Re-scan for the extension (e.g. after the user installs it). */
  redetect: () => Promise<void>;
}

export function useWallet(): UseWallet {
  const [status, setStatus] = useState<WalletStatus>('detecting');
  const [connection, setConnection] = useState<ConnectionInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [injection, setInjection] = useState<InjectionDebug>(() => inspectInjection());

  const detect = useCallback(async () => {
    setStatus('detecting');
    const connector = await waitForConnector(4000);
    setInjection(inspectInjection());
    if (!connector) {
      setStatus('unavailable');
      return;
    }
    // Wallet present — try to restore an existing authorized session silently.
    if (await isAlreadyConnected()) {
      try {
        const info = await connectLace();
        setConnection(info);
        setStatus('connected');
        return;
      } catch {
        /* fall through to idle — user can connect manually */
      }
    }
    setStatus('idle');
  }, []);

  // Detect on mount, and re-check when the tab regains focus (user may have
  // just installed/enabled the extension).
  useEffect(() => {
    void detect();
    const onFocus = () => {
      setInjection(inspectInjection());
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [detect]);

  const connect = useCallback(async () => {
    setError(null);
    setHint(null);
    setStatus('connecting');
    try {
      const info = await connectLace();
      setConnection(info);
      setInjection(inspectInjection());
      setStatus('connected');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      const inj = inspectInjection();
      setInjection(inj);
      setStatus(inj.chosenKey ? 'idle' : 'error');
    }
  }, []);

  const disconnect = useCallback(() => {
    setConnection(null);
    setError(null);
    setHint(DISCONNECT_HINT);
    setStatus(inspectInjection().chosenKey ? 'idle' : 'unavailable');
  }, []);

  return { status, connection, error, hint, injection, connect, disconnect, redetect: detect };
}
