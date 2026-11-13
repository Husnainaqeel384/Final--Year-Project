export function formatMoney(value, currency = 'USD') {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

/** Short form for tight spaces such as chart axes. */
export function formatCompact(value) {
  const number = Number(value) || 0;
  return new Intl.NumberFormat(undefined, {
    notation: Math.abs(number) >= 10000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(number);
}

/** Current month in the viewer's own timezone, as the API expects it. */
export function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function today() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

/** Noon avoids a date landing on the previous day in timezones behind UTC. */
function parseDateOnly(value) {
  return new Date(`${String(value).slice(0, 10)}T12:00:00`);
}

export function formatDate(value) {
  if (!value) return '';
  return parseDateOnly(value).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatMonth(month, style = 'long') {
  if (!month) return '';
  return parseDateOnly(`${month}-15`).toLocaleDateString(undefined, {
    month: style,
    year: style === 'long' ? 'numeric' : '2-digit',
  });
}

// Keep in sync with the currency schema in apps/api/src/utils/schemas.js.
export const CURRENCIES = ['USD', 'EUR', 'GBP', 'PKR', 'INR', 'AED', 'SAR', 'QAR', 'KWD', 'CAD', 'AUD', 'JPY', 'CNY', 'CHF', 'SGD', 'MYR', 'BDT', 'TRY', 'ZAR', 'NGN'];

const currencyNames = new Intl.DisplayNames(undefined, { type: 'currency' });

export function currencyName(code) {
  try {
    return currencyNames.of(code);
  } catch {
    return code;
  }
}

/** The short sign shown on the currency button, such as "$" or "Rs". */
export function currencySymbol(code) {
  const parts = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: code,
    currencyDisplay: 'narrowSymbol',
  }).formatToParts(0);
  return parts.find((part) => part.type === 'currency')?.value ?? code;
}

/** Compact money for headline summaries, such as "$63.2K". */
export function formatMoneyCompact(value, currency = 'USD') {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number(value) || 0);
}

/** Whole days from today to a date-only value; negative means it has passed. */
export function daysUntil(value) {
  const start = new Date(`${today()}T12:00:00`);
  const due = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  return Math.round((due - start) / 86_400_000);
}

export function describeDue(value) {
  const days = daysUntil(value);
  if (days < -1) return `${-days} days overdue`;
  if (days === -1) return 'Yesterday';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
}

/** A date as a statement heading, such as "Thu, Nov 12". */
export function formatDay(value) {
  return new Date(`${String(value).slice(0, 10)}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/** Moves a YYYY-MM month forwards or backwards. */
export function shiftMonth(month, delta) {
  const [year, monthNumber] = month.split('-').map(Number);
  const date = new Date(year, monthNumber - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}
