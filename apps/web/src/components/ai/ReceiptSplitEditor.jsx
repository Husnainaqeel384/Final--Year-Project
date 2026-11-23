import { useCategories } from '../../hooks/useCategories';
import { formatMoney } from '../../lib/format';
import { splitByCategory } from '../../lib/receiptSplit';

/**
 * The lines of a scanned receipt, each with a category, and the expenses they
 * will become. The person can change any category or untick a line; nothing is
 * saved until they confirm.
 */
export function ReceiptSplitEditor({ items, total, spread, currency, onItemsChange, onSpreadChange }) {
  const { categories } = useCategories();
  const known = categories.flatMap((category) => category.subcategories.map((sub) => sub.name));
  // Categories the AI picked from the workspace's own plans may not be in the shared list.
  const options = [...new Set([...known, ...items.map((item) => item.categoryName).filter(Boolean)])].sort();
  const result = splitByCategory(items, total, { spread });

  const update = (id, changes) => onItemsChange(items.map((item) => (item.id === id ? { ...item, ...changes } : item)));

  return (
    <div className="space-y-4">
      <div className="border-line overflow-hidden rounded-lg border">
        <ul className="divide-line max-h-72 divide-y overflow-y-auto">
          {items.map((item) => (
            <li key={item.id} className={`flex flex-wrap items-center gap-x-3 gap-y-1.5 px-3 py-2 text-sm ${item.include ? '' : 'opacity-50'}`}>
              <input
                type="checkbox"
                checked={item.include}
                onChange={(event) => update(item.id, { include: event.target.checked })}
                aria-label={`Include ${item.description}`}
                className="accent-accent size-4 shrink-0"
              />
              <span className="min-w-0 flex-1 truncate" title={item.description}>
                {item.description}
              </span>
              <select
                aria-label={`Category for ${item.description}`}
                value={item.categoryName ?? ''}
                disabled={!item.include}
                onChange={(event) => update(item.id, { categoryName: event.target.value || null })}
                // On a phone the picker gets its own row under the line, so the item name stays readable.
                className={`border-line bg-surface order-last h-8 w-full shrink-0 rounded-md border px-2 text-xs max-sm:ml-7 max-sm:w-[calc(100%-1.75rem)] sm:order-none sm:w-44 ${item.include && !item.categoryName ? 'border-warning' : ''}`}
              >
                <option value="">Choose…</option>
                {options.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <span className={`tabular w-20 shrink-0 text-right ${item.amount < 0 ? 'text-good' : ''}`}>{formatMoney(item.amount, currency)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-surface-2/60 space-y-2 rounded-lg p-3 text-sm">
        <p className="font-medium">
          {result.groups.length === 0
            ? 'Tick at least one line with a category.'
            : `Saves as ${result.groups.length} ${result.groups.length === 1 ? 'expense' : 'expenses'}:`}
        </p>
        {result.groups.length > 0 && (
          <ul className="space-y-1">
            {result.groups.map((group) => (
              <li key={group.categoryName} className="flex justify-between gap-3">
                <span className="text-ink-2">
                  {group.categoryName}
                  <span className="text-ink-3 text-xs">
                    {' '}
                    · {group.descriptions.length} {group.descriptions.length === 1 ? 'line' : 'lines'}
                    {group.share !== 0 && `, ${group.share > 0 ? '+' : ''}${formatMoney(group.share, currency)} shared`}
                  </span>
                </span>
                <span className={`tabular font-medium ${group.amount <= 0 ? 'text-critical' : ''}`}>{formatMoney(group.amount, currency)}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="text-ink-3 border-line border-t pt-2 text-xs">
          Lines add up to {formatMoney(result.itemsTotal, currency)}
          {total !== null && total !== undefined ? `; the receipt total is ${formatMoney(total, currency)}.` : '.'}
        </p>
        {result.extraKept !== 0 && (
          <label className="flex cursor-pointer items-start gap-2 text-xs">
            <input type="checkbox" checked={spread} onChange={(event) => onSpreadChange(event.target.checked)} className="accent-accent mt-0.5 size-4" />
            <span>
              {result.allIncluded ? 'Share the ' : 'Share the ticked lines’ part of the '}
              {formatMoney(Math.abs(result.extraKept), currency)} {result.extraKept > 0 ? 'of tax, tip or fees' : 'discount'} across the
              categories{result.allIncluded ? ', so the expenses add up to what you paid' : ''}
            </span>
          </label>
        )}
        {result.uncategorised > 0 && (
          <p className="text-warning text-xs">
            Choose a category for {result.uncategorised} {result.uncategorised === 1 ? 'line' : 'lines'}, or untick {result.uncategorised === 1 ? 'it' : 'them'}.
          </p>
        )}
      </div>
    </div>
  );
}
