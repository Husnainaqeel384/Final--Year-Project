import { db } from '../db/knex.js';
import { notFound } from '../utils/errors.js';
import { dateToMonth, shiftMonth } from '../utils/months.js';
import { applyScope } from '../utils/scope.js';
import { budgetsForMonth, categorySpendRows, listBudgets, presentItem } from './budget.service.js';

const round = (value) => Math.round(value * 100) / 100;

export async function listReportMonths(workspace) {
  const rows = await applyScope(db('budgets'), workspace).distinct('month').orderBy('month', 'desc');
  return rows.map((row) => dateToMonth(row.month));
}

/**
 * One month across all of its budgets. Categories planned in more than one
 * budget are added together, and spending covers every expense in the month.
 */
export async function monthSummary(workspace, month) {
  const budgets = await budgetsForMonth(workspace, month);
  if (budgets.length === 0) return null;

  const [items, spendRows] = await Promise.all([
    db('budget_items')
      .whereIn('budget_id', budgets.map((budget) => budget.id))
      .groupBy('category_name')
      .orderBy('category_name')
      .select('category_name', db.raw('SUM(amount) as amount')),
    categorySpendRows(workspace, month),
  ]);
  const spending = new Map(spendRows.map((row) => [row.category_name, row.total]));
  const presented = items.map((item) => presentItem(item, spending.get(item.category_name) ?? 0));

  return {
    month,
    budgetIds: budgets.map((budget) => budget.id),
    income: round(budgets.reduce((sum, budget) => sum + budget.income, 0)),
    savingsGoal: round(budgets.reduce((sum, budget) => sum + budget.savings_goal, 0)),
    planned: round(presented.reduce((sum, item) => sum + item.amount, 0)),
    spent: round(spendRows.reduce((sum, row) => sum + row.total, 0)),
    items: presented,
  };
}

export async function getReport(workspace, month) {
  const summary = await monthSummary(workspace, month);
  if (!summary) throw notFound('Report');

  // A shift across the year boundary is what the original report got wrong for January.
  const previous = await monthSummary(workspace, shiftMonth(month, -1));

  return {
    month,
    income: summary.income,
    savingsGoal: summary.savingsGoal,
    planned: summary.planned,
    spent: summary.spent,
    remaining: round(summary.planned - summary.spent),
    items: summary.items,
    budgets: await listBudgets(workspace, { month }),
    previous: previous && {
      month: previous.month,
      income: previous.income,
      savingsGoal: previous.savingsGoal,
      spent: previous.spent,
    },
  };
}
