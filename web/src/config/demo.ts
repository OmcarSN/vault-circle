// ═══════════════════════════════════════════════════════════════════════
// Demo circle — hardcoded fake data for mentor review / demo video
// ═══════════════════════════════════════════════════════════════════════

export const DEMO_CIRCLE_ID = 'demo-community-fund';

export const DEMO_CIRCLE = {
  id: DEMO_CIRCLE_ID,
  name: 'Community Savings Fund',
  requiredShare: 100n,
  memberCount: 5n,
  cycleCount: 2n,
  currentRecipientIndex: 2n,
  poolTotal: 500n,
  poolSolvent: true,
  totalDeposits: 500n,
};

export function isDemoCircle(id: string | undefined): boolean {
  return id === DEMO_CIRCLE_ID;
}
