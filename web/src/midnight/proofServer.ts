import { ENDPOINTS } from '../config/network';

// ═══════════════════════════════════════════════════════════════════════
// Proof server reachability check.
//
// Submitting a circuit call generates a ZK proof, which Midnight routes to a
// local proof server (Docker, default http://127.0.0.1:6300). This helper
// lets the UI tell the user *before* they try to submit whether that server
// is up — turning Lace's opaque "mandatory network requirement" into a clear
// precondition.
//
// We prefer the URI the connected wallet reports (proverServerUri); callers
// pass it in, falling back to the configured default.
// ═══════════════════════════════════════════════════════════════════════

export type ProofServerStatus = 'up' | 'down' | 'unknown';

/**
 * Probe the proof server. It has no guaranteed CORS-friendly health route, so
 * a browser fetch may be blocked by CORS even when the server is up — in that
 * case we report 'unknown' rather than a false 'down'. A network-level failure
 * (connection refused) reliably means 'down'.
 */
export async function checkProofServer(
  proverServerUri: string = ENDPOINTS.proofServer,
): Promise<ProofServerStatus> {
  const base = proverServerUri.replace(/\/$/, '');
  try {
    // 'no-cors' lets us distinguish "reachable" (opaque response resolves)
    // from "refused" (throws) without needing CORS headers.
    await fetch(base + '/health', { mode: 'no-cors' });
    return 'up';
  } catch {
    // Retry the root path — some server versions 404 /health but still answer.
    try {
      await fetch(base + '/', { mode: 'no-cors' });
      return 'up';
    } catch {
      return 'down';
    }
  }
}
