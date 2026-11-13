/**
 * Page numbers to show: always the first and last, plus the current page and
 * its neighbours. Gaps become "…" so the bar stays the same width on long lists.
 */
export function pageNumbers(page, pages) {
  if (pages <= 7) return Array.from({ length: pages }, (_, index) => index + 1);
  const wanted = new Set([1, pages, page - 1, page, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((value) => wanted.add(value));
  if (page >= pages - 2) [pages - 1, pages - 2, pages - 3].forEach((value) => wanted.add(value));

  const sorted = [...wanted].filter((value) => value >= 1 && value <= pages).sort((a, b) => a - b);
  return sorted.flatMap((value, index) => (index > 0 && value - sorted[index - 1] > 1 ? ['gap', value] : [value]));
}
