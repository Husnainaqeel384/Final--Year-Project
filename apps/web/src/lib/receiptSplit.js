// Whole cents throughout, because 0.1 + 0.2 isn't 0.3 in floating point.
const toCents = (value) => Math.round(Number(value) * 100);

/**
 * Turns a receipt's line items into one expense per category.
 *
 * `extra` is the receipt total minus all scanned lines: tax, tip, service charges or
 * discounts printed only on the total. With `spread`, it is shared across the
 * categories in proportion to their size, to the cent, so the expenses add up to
 * what was paid. An unticked line leaves with its own share of the extra, so its
 * cost never lands on the lines that were kept.
 */
export function splitByCategory(items, total, { spread = true } = {}) {
  const allCents = items.reduce((sum, item) => sum + toCents(item.amount), 0);
  const extra = total === null || total === undefined ? 0 : toCents(total) - allCents;

  const groups = new Map();
  for (const item of items) {
    if (!item.include || !item.categoryName) continue;
    const group = groups.get(item.categoryName) ?? { categoryName: item.categoryName, cents: 0, descriptions: [] };
    group.cents += toCents(item.amount);
    group.descriptions.push(item.description);
    groups.set(item.categoryName, group);
  }

  const list = [...groups.values()];
  const base = list.reduce((sum, group) => sum + group.cents, 0);
  const shares = list.map(() => 0);
  // The kept lines' part of the extra, in proportion to their share of all the lines.
  const extraKept = spread && allCents !== 0 ? Math.round((extra * base) / allCents) : 0;

  if (extraKept !== 0 && base > 0) {
    // Largest remainder: whole cents first, then the leftover cents to the biggest fractions.
    const exact = list.map((group) => (extraKept * group.cents) / base);
    exact.forEach((value, index) => {
      shares[index] = Math.trunc(value);
    });
    let left = extraKept - shares.reduce((sum, share) => sum + share, 0);
    const order = exact
      .map((value, index) => ({ index, fraction: Math.abs(value - Math.trunc(value)) }))
      .sort((a, b) => b.fraction - a.fraction);
    for (let i = 0; left !== 0; i = (i + 1) % order.length) {
      shares[order[i].index] += Math.sign(left);
      left -= Math.sign(left);
    }
  }

  return {
    groups: list.map((group, index) => ({
      categoryName: group.categoryName,
      descriptions: group.descriptions,
      amount: (group.cents + shares[index]) / 100,
      share: shares[index] / 100,
    })),
    extra: extra / 100,
    extraKept: extraKept / 100,
    allIncluded: items.every((item) => item.include),
    itemsTotal: allCents / 100,
    included: items.filter((item) => item.include).length,
    uncategorised: items.filter((item) => item.include && !item.categoryName).length,
  };
}

/** "Maple Grocers: Milk 2L +3 more", short enough for the description field. */
export function describeGroup(merchant, descriptions) {
  const first = descriptions[0] ?? '';
  const more = descriptions.length > 1 ? ` +${descriptions.length - 1} more` : '';
  return `${merchant ? `${merchant}: ` : ''}${first}${more}`.slice(0, 255);
}
