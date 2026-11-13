import { LuReceipt } from 'react-icons/lu';
import { formatMoney } from '../../lib/format';
import { EmptyState } from '../ui/Feedback';

const CATEGORY_ROWS = 6;

/** Plain rows read better than a chart for a ranked list; the long tail folds into "Other". */
export function CategoryBreakdown({ categories, currency }) {
  const spending = categories.filter((item) => item.spent > 0);
  if (spending.length === 0) return <EmptyState icon={LuReceipt} title="No spending yet" />;

  const total = spending.reduce((sum, item) => sum + item.spent, 0);
  const rows = spending.slice(0, CATEGORY_ROWS);
  const rest = spending.slice(CATEGORY_ROWS);
  if (rest.length > 0) {
    rows.push({ category: `Other (${rest.length})`, spent: rest.reduce((sum, item) => sum + item.spent, 0) });
  }
  const largest = Math.max(...rows.map((row) => row.spent));

  return (
    <ul className="space-y-4">
      {rows.map((row) => (
        <li key={row.category}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate">{row.category}</span>
            <span className="tabular shrink-0 font-medium">
              {formatMoney(row.spent, currency)}
              <span className="text-ink-3 ml-2 inline-block w-9 text-right text-xs font-normal">
                {Math.round((row.spent / total) * 100)}%
              </span>
            </span>
          </div>
          <div className="bg-surface-2 mt-1.5 h-1.5 rounded-full">
            <div
              className="h-full rounded-full"
              style={{ width: `${(row.spent / largest) * 100}%`, background: 'var(--chart-1)' }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
