import { useCallback, useEffect, useState } from 'react';
import { readLedger, type VaultLedger, type LedgerReadError } from '../midnight/ledger';
import { CONTRACT_ADDRESS } from '../config/network';

// ═══════════════════════════════════════════════════════════════════════
// useLedger — fetch + refresh the public Vault Circle ledger (read-only).
// No proof server involved. Auto-fetches once on mount when an address is
// configured; exposes refresh() for the UI's manual refresh button.
// ═══════════════════════════════════════════════════════════════════════

export interface UseLedger {
  ledger: VaultLedger | null;
  error: LedgerReadError | null;
  loading: boolean;
  /** True only when an on-chain address is configured to read from. */
  hasAddress: boolean;
  refresh: () => Promise<void>;
}

export function useLedger(): UseLedger {
  const [ledger, setLedger] = useState<VaultLedger | null>(null);
  const [error, setError] = useState<LedgerReadError | null>(null);
  const [loading, setLoading] = useState(false);
  const hasAddress = CONTRACT_ADDRESS.length > 0;

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await readLedger(CONTRACT_ADDRESS);
    if (result.ok) {
      setLedger(result.ledger);
    } else {
      setError(result.error);
      setLedger(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (hasAddress) void refresh();
  }, [hasAddress, refresh]);

  return { ledger, error, loading, hasAddress, refresh };
}
