import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { pageNumbers } from '../../lib/pagination';

const cell =
  'inline-flex size-8 items-center justify-center rounded-lg text-[13px] tabular transition-colors disabled:cursor-not-allowed disabled:opacity-40';

/**
 * Numbered pagination with a "Showing x–y of z" summary. Pass onPerPageChange
 * to let people choose how many rows a page holds.
 */
export function Pagination({ page, total, perPage, noun, onPageChange, onPerPageChange, perPageOptions = [10, 20, 50], compact = false }) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  if (total === 0 || (pages === 1 && !onPerPageChange)) return null;

  const first = (page - 1) * perPage + 1;
  const last = Math.min(page * perPage, total);

  return (
    <nav
      aria-label={`${noun} pages`}
      className={`border-line flex flex-wrap items-center justify-between gap-3 border-t ${compact ? 'px-4 py-2' : 'px-5 py-3'}`}
    >
      <div className="text-ink-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]">
        <span className="tabular">
          Showing <span className="text-ink-2 font-medium">{first}–{last}</span> of{' '}
          <span className="text-ink-2 font-medium">{total}</span> {noun}
        </span>
        {onPerPageChange && (
          <label className="flex items-center gap-2">
            Rows per page
            <select
              value={perPage}
              onChange={(event) => onPerPageChange(Number(event.target.value))}
              className="border-line bg-surface text-ink h-8 rounded-md border px-2 text-[13px]"
            >
              {perPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous page"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className={`${cell} text-ink-2 enabled:hover:bg-surface-2`}
          >
            <LuChevronLeft className="size-4" />
          </button>
          {pageNumbers(page, pages).map((value, index) =>
            value === 'gap' ? (
              <span key={`gap-${index}`} className="text-ink-3 w-6 text-center text-[13px]" aria-hidden="true">
                …
              </span>
            ) : (
              <button
                key={value}
                type="button"
                aria-label={`Page ${value}`}
                aria-current={value === page ? 'page' : undefined}
                onClick={() => onPageChange(value)}
                className={`${cell} ${
                  value === page ? 'bg-accent font-semibold text-white' : 'text-ink-2 hover:bg-surface-2'
                }`}
              >
                {value}
              </button>
            ),
          )}
          <button
            type="button"
            aria-label="Next page"
            disabled={page >= pages}
            onClick={() => onPageChange(page + 1)}
            className={`${cell} text-ink-2 enabled:hover:bg-surface-2`}
          >
            <LuChevronRight className="size-4" />
          </button>
        </div>
      )}
    </nav>
  );
}
