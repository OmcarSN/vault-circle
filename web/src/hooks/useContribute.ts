import { useCallback, useEffect, useState } from 'react';
import { checkProofServer, type ProofServerStatus } from '../midnight/proofServer';
import type { CircuitCallResult } from '../midnight/circuits';
import type { ConnectionInfo } from '../midnight/connector';
import { CONTRACT_ADDRESS } from '../config/network';

export type CallPhase =
  | 'idle'
  | 'checking'
  | 'proving'
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

  useEffect(() => {
    void recheckProofServer();
  }, [recheckProofServer]);

  const contribute = useCallback(
    async (connection: ConnectionInfo, amount: bigint) => {
      setError(null);
      setResult(null);

      // If no contract deployed on-chain yet, simulate client-side ZK proof execution
      if (!hasContract) {
        setPhase('proving');
        await new Promise((r) => setTimeout(r, 1500));

        const isMet = amount >= 100n;
        const fakeTxId = '0x' + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

        setResult({
          returnValue: isMet,
          txId: `tx_zk_${fakeTxId}`,
        });
        setPhase('done');
        return;
      }

      // If live contract address IS set, attempt live network circuit call
      setPhase('checking');
      const status = await checkProofServer(connection.uris.proverServerUri);
      setProofServer(status);
      if (status === 'down') {
        setError(
          'Proof server not reachable at ' +
            connection.uris.proverServerUri +
            '. Start it with Docker and retry.',
        );
        setPhase('error');
        return;
      }

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
