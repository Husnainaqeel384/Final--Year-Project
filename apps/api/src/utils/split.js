/**
 * Splits an amount between people without losing a cent. Calculated in whole
 * cents because 100 / 3 cannot be represented exactly in floating point. The
 * first members in the list absorb any leftover cents.
 */
export function allocate(amount, peopleCount) {
  const cents = Math.round(amount * 100);
  const base = Math.floor(cents / peopleCount);
  const leftover = cents - base * peopleCount;
  return Array.from({ length: peopleCount }, (_, index) => (base + (index < leftover ? 1 : 0)) / 100);
}

export const addMoney = (a, b) => Math.round((a + b) * 100) / 100;
