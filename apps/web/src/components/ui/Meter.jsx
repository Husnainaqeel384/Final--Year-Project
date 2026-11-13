import { LuCircleCheck, LuTriangleAlert } from 'react-icons/lu';

/** Severity shared by every budget view so a state always looks and reads the same. */
function budgetStatus(percentUsed) {
  if (percentUsed > 100) return { fill: 'bg-critical', text: 'text-critical', label: 'Over budget' };
  // A bill paid exactly in full is normal, not a problem.
  if (percentUsed === 100) return { fill: 'bg-accent-text', text: 'text-ink-3', label: 'Fully used' };
  if (percentUsed >= 80) return { fill: 'bg-warning', text: 'text-warning', label: 'Near limit' };
  return { fill: 'bg-accent-text', text: 'text-ink-3', label: 'On track' };
}

export function Meter({ percent, label }) {
  const status = budgetStatus(percent);
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(percent)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className="bg-surface-2 h-1.5 w-full overflow-hidden rounded-full"
    >
      <div
        className={`h-full rounded-full ${status.fill}`}
        style={{ width: `${Math.min(percent, 100)}%` }}
      />
    </div>
  );
}

/** Icon and words accompany the color so the state never depends on color vision. */
export function BudgetStatusLabel({ percent }) {
  const status = budgetStatus(percent);
  const Icon = percent >= 80 && percent !== 100 ? LuTriangleAlert : LuCircleCheck;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${status.text}`}>
      <Icon className="size-3.5" aria-hidden="true" />
      {status.label}
    </span>
  );
}
