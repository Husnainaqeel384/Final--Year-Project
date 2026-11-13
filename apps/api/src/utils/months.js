export const monthToDate = (month) => `${month}-01`;
export const dateToMonth = (date) => String(date).slice(0, 7);

export function currentMonth(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function shiftMonth(month, delta) {
  const [year, monthNumber] = month.split('-').map(Number);
  const date = new Date(Date.UTC(year, monthNumber - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function daysInMonth(month) {
  const [year, monthNumber] = month.split('-').map(Number);
  return new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
}

/** First day of this month and of the next, for a range that uses the spent_on index. */
export function monthRange(month) {
  return [monthToDate(month), monthToDate(shiftMonth(month, 1))];
}
