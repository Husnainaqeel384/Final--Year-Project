import { db } from '../db/knex.js';
import { buildForecast } from '../utils/forecast.js';
import { dateToMonth, monthToDate, shiftMonth } from '../utils/months.js';
import { applyScope } from '../utils/scope.js';
import { categorySpendRows } from './budget.service.js';
import { monthSummary } from './report.service.js';
import { presentReminder } from './reminder.service.js';
import { presentTransaction } from './transaction.service.js';

const TREND_MONTHS = 12;
const round = (value) => Math.round(value * 100) / 100;

async function monthlySpending(workspace, firstMonth, lastMonth) {
  const rows = await applyScope(db('expenses'), workspace)
    .where('spent_on', '>=', monthToDate(firstMonth))
    .where('spent_on', '<', monthToDate(shiftMonth(lastMonth, 1)))
    .groupByRaw("DATE_FORMAT(spent_on, '%Y-%m')")
    .select(db.raw("DATE_FORMAT(spent_on, '%Y-%m') as month"), db.raw('SUM(amount) as total'));
  return new Map(rows.map((row) => [row.month, row.total]));
}

/** Income summed per month: a month can now have several budgets. */
async function monthlyIncome(workspace, firstMonth, lastMonth) {
  const rows = await applyScope(db('budgets'), workspace)
    .where('month', '>=', monthToDate(firstMonth))
    .where('month', '<=', monthToDate(lastMonth))
    .groupBy('month')
    .select('month', db.raw('SUM(income) as total'));
  return new Map(rows.map((row) => [dateToMonth(row.month), row.total]));
}

/** The dashboard looks at a whole month, adding together every budget in it. */
export async function getDashboard(workspace, month) {
  const firstMonth = shiftMonth(month, -(TREND_MONTHS - 1));

  const [summary, spendRows, monthlySpend, income, reminders, transactions] = await Promise.all([
    monthSummary(workspace, month),
    categorySpendRows(workspace, month),
    monthlySpending(workspace, firstMonth, month),
    monthlyIncome(workspace, firstMonth, month),
    applyScope(db('reminders'), workspace).where({ status: 'pending' }).orderBy('due_date').limit(5),
    applyScope(db('transactions'), workspace)
      .orderBy([{ column: 'date', order: 'desc' }, { column: 'id', order: 'desc' }])
      .limit(5),
  ]);

  const trend = Array.from({ length: TREND_MONTHS }, (_, index) => {
    const key = shiftMonth(firstMonth, index);
    return { month: key, income: income.get(key) ?? 0, spent: monthlySpend.get(key) ?? 0 };
  });

  const planned = summary?.planned ?? 0;
  const spent = round(spendRows.reduce((sum, row) => sum + row.total, 0));
  const entries = new Map(spendRows.map((row) => [row.category_name, row.entries]));
  const previousSpent = trend[TREND_MONTHS - 2].spent;

  // Planned categories plus any spending outside the plan, biggest first.
  const items = summary?.items ?? [];
  const planNames = new Set(items.map((item) => item.categoryName));
  const categories = [
    ...items.map((item) => ({
      category: item.categoryName,
      planned: item.amount,
      spent: item.spent,
      percentUsed: item.percentUsed,
    })),
    ...spendRows
      .filter((row) => !planNames.has(row.category_name))
      .map((row) => ({ category: row.category_name, planned: 0, spent: row.total, percentUsed: 100 })),
  ].sort((a, b) => b.spent - a.spent);

  const previousSpend = trend.slice(0, -1).reverse().map((point) => point.spent).filter((value) => value > 0);

  return {
    month,
    hasBudget: Boolean(summary),
    budgetCount: summary?.budgetIds.length ?? 0,
    kpis: {
      income: summary?.income ?? 0,
      planned,
      spent,
      remaining: round(planned - spent),
      savingsGoal: summary?.savingsGoal ?? 0,
      spentChangePct: previousSpent > 0 ? round(((spent - previousSpent) / previousSpent) * 100) : null,
    },
    forecast: buildForecast({
      spent,
      month,
      previousSpend,
      categories: categories.map((item) => ({
        planned: item.planned,
        spent: item.spent,
        count: entries.get(item.category) ?? 0,
      })),
    }),
    trend,
    categories,
    reminders: reminders.map(presentReminder),
    transactions: transactions.map(presentTransaction),
  };
}
