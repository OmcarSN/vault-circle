import { useCallback, useEffect, useState } from 'react';
import { checkProofServer, type ProofServerStatus } from '../midnight/proofServer';
import type { CircuitCallResult } from '../midnight/circuits';
import type { ConnectionInfo } from '../midnight/connector';
import { CONTRACT_ADDRESS } from '../config/network';

// ═══════════════════════════════════════════════════════════════════════
// useContribute — drive the contribute() circuit call and surface every
// precondition (wallet connected? proof server up? contract deployed?) plus
// the in-flight phase and the final disclosed result.
// ═══════════════════════════════════════════════════════════════════════

export type CallPhase =
  | 'idle'
  | 'checking' // probing the proof server
  | 'proving' // building + proving + submitting
  | 'done'
  | 'error';

export interface UseContribute {
  phase: CallPhase;
  proofServer: ProofServerStatus;
  result: CircuitCallResult | null;
  error: string | null;
  hasContract: boolean;
  recheckProofServer: () => Promise<void>;
  contribute: (connection: ConnectionInfo, amount: bigint) => Promise<void>;
}

export function useContribute(): UseContribute {
  const [phase, setPhase] = useState<CallPhase>('idle');
  const [proofServer, setProofServer] = useState<ProofServerStatus>('unknown');
  const [result, setResult] = useState<CircuitCallResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasContract = CONTRACT_ADDRESS.length > 0;

  const recheckProofServer = useCallback(async (uri?: string) => {
    setProofServer(await checkProofServer(uri));
  }, []);

  // Probe once on mount so the UI can show the requirement upfront.
  useEffect(() => {
    void recheckProofServer();
  }, [recheckProofServer]);

  const contribute = useCallback(
    async (connection: ConnectionInfo, amount: bigint) => {
      setError(null);
      setResult(null);

      if (!hasContract) {
        setError(
          'No contract deployed yet. Deploy in Phase 2, then set the address ' +
            'to submit a real contribute() call.',
        );
        setPhase('error');
        return;
      }

      // Precondition: proof server must be reachable.
      setPhase('checking');
      const status = await checkProofServer(connection.uris.proverServerUri);
      setProofServer(status);
      if (status === 'down') {
        setError(
          'Proof server not reachable at ' +
            connection.uris.proverServerUri +
            '. Start it with Docker (see the panel) and retry.',
        );
        setPhase('error');
        return;
      }

      // Submit. Import the heavy module lazily so this is the only place the
      // SDK/WASM is pulled in.
      setPhase('proving');
      try {
        const { callContribute } = await import('../midnight/circuits');
        const res = await callContribute(
          connection.api,
          connection.state,
          connection.uris.proverServerUri,
          amount,
        );
        setResult(res);
        setPhase('done');
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        setPhase('error');
      }
    },
    [hasContract],
  );

  return {
    phase,
    proofServer,
    result,
    error,
    hasContract,
    recheckProofServer,
    contribute,
  };
}
