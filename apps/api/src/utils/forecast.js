import { currentMonth, daysInMonth } from './months.js';

const round = (value) => Math.round(value * 100) / 100;

/**
 * Bills that arrive once a month, such as rent, would be wildly overstated by a
 * straight-line projection. A category paid in a single expense is assumed to
 * finish at its plan; one with repeated spending is projected from its pace.
 */
function projectCategory({ planned, spent, count }, monthProgress) {
  if (count >= 2) return spent / monthProgress;
  return Math.max(spent, planned);
}

/**
 * Deliberately simple and explainable. Next month is a weighted average that
 * favours recent months.
 *
 * @param spent          total spent in the month being viewed
 * @param month          the month being viewed, YYYY-MM
 * @param categories     [{ planned, spent, count }] for that month
 * @param previousSpend  completed months before it, newest first
 */
export function buildForecast({ spent, month, categories, previousSpend, now = new Date() }) {
  const totalDays = daysInMonth(month);
  const thisMonth = currentMonth(now);
  const isCurrentMonth = month === thisMonth;

  let daysElapsed = totalDays;
  if (isCurrentMonth) daysElapsed = now.getDate();
  else if (month > thisMonth) daysElapsed = 0;

  const projectedSpend = isCurrentMonth
    ? categories.reduce((sum, category) => sum + projectCategory(category, daysElapsed / totalDays), 0)
    : spent;

  const weights = [3, 2, 1];
  const recent = previousSpend.slice(0, 3);
  const nextMonth =
    recent.length > 0
      ? recent.reduce((sum, value, index) => sum + value * weights[index], 0) /
        weights.slice(0, recent.length).reduce((sum, value) => sum + value, 0)
      : projectedSpend;

  return {
    isCurrentMonth,
    daysElapsed,
    daysInMonth: totalDays,
    dailyAverage: round(daysElapsed > 0 ? spent / daysElapsed : 0),
    projectedSpend: round(projectedSpend),
    nextMonth: round(nextMonth),
  };
}
