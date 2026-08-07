import { AlertIcon } from './Icons';

// Persistent, unmistakable label for demonstration surfaces. Shown wherever the
// UI renders mock/simulated data so it can never be mistaken for a live
// on-chain transaction.
export function DemoBanner({
  note = 'Values shown are illustrative and generated locally — no funds move and nothing is written on-chain.',
}: {
  note?: string;
}) {
  return (
    <div className="demo-banner" role="note">
      <AlertIcon size={15} />
      <span>
        Demonstration data — not a live transaction.{' '}
        <span className="demo-banner-note">{note}</span>
      </span>
    </div>
  );
}
