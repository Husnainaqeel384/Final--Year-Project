import { logger } from '../config/logger.js';
import { db } from '../db/knex.js';
import { AppError, notFound } from '../utils/errors.js';
import { dateToMonth, monthRange, monthToDate } from '../utils/months.js';
import { applyScope, scopeColumns } from '../utils/scope.js';
import { resolveExpenseBudget } from './budget.service.js';
import { emitEvent } from './webhook.service.js';

const present = (row) => ({
  id: row.id,
  categoryName: row.category_name,
  amount: row.amount,
  description: row.description,
  spentOn: row.spent_on,
  budgetId: row.budget_id,
  budgetName: row.budget_name ?? null,
  // Set when the expense mirrors a "sent" transaction; it is then edited through that transaction.
  transactionId: row.transaction_id ?? null,
});

/** Expenses with the name of the budget they count toward. */
function expensesWithBudget(workspace) {
  return applyScope(db('expenses as e'), workspace, 'e')
    .leftJoin('budgets as b', 'b.id', 'e.budget_id')
    .select('e.*', 'b.name as budget_name');
}

/**
 * The filters shared by the list and the summary. `budget` is a budget id or
 * "none" for expenses that don't belong to a budget.
 */
function applyFilters(query, { month, budget, search, day, category }) {
  const [start, end] = monthRange(month);
  query.where('e.spent_on', '>=', start).where('e.spent_on', '<', end);
  if (day) query.where('e.spent_on', day);
  if (category) query.where('e.category_name', category);
  if (budget === 'none') query.whereNull('e.budget_id');
  else if (budget) query.where('e.budget_id', budget);
  if (search) {
    // % and _ are wildcards in LIKE; escaped so a search for "50%" means exactly that.
    const term = `%${search.replace(/[\\%_]/g, '\\$&')}%`;
    // Plain LIKE: knex's whereLike forces a binary collation MySQL rejects for utf8mb4 columns.
    query.where((inner) => inner.where('e.description', 'like', term).orWhere('e.category_name', 'like', term));
  }
  return query;
}

const filteredExpenses = (workspace, filters) =>
  applyScope(db('expenses as e'), workspace, 'e').modify((query) => applyFilters(query, filters));

export async function listExpenses(workspace, filters, { page, limit }) {
  const [rows, { total }] = await Promise.all([
    expensesWithBudget(workspace)
      .modify((query) => applyFilters(query, filters))
      .orderBy([{ column: 'e.spent_on', order: 'desc' }, { column: 'e.id', order: 'desc' }])
      .limit(limit)
      .offset((page - 1) * limit),
    filteredExpenses(workspace, filters).count('* as total').first(),
  ]);
  return { items: rows.map(present), total, page, limit };
}

/** Monthly limits per category, across the month's budgets or just the chosen one. */
async function plannedByCategory(workspace, { month, budget }) {
  if (budget === 'none') return new Map();
  const rows = await applyScope(db('budget_items as i').join('budgets as b', 'b.id', 'i.budget_id'), workspace, 'b')
    .where('b.month', monthToDate(month))
    .modify((query) => {
      if (budget) query.where('b.id', budget);
    })
    .groupBy('i.category_name')
    .select('i.category_name', db.raw('SUM(i.amount) as planned'));
  return new Map(rows.map((row) => [row.category_name, row.planned]));
}

/**
 * One row per category, so a category used many times is shown once with its
 * total. Also returns the figures for the summary card and the daily chart.
 */
export async function summarizeExpenses(workspace, filters, { page, limit }) {
  const { day: _day, ...withoutDay } = filters;

  const [groups, groupCount, totals, largest, daily, month, planned] = await Promise.all([
    filteredExpenses(workspace, filters)
      .groupBy('e.category_name')
      .select(
        'e.category_name',
        db.raw('SUM(e.amount) as total'),
        db.raw('COUNT(*) as entries'),
        db.raw('MAX(e.spent_on) as last_spent_on'),
        db.raw('MAX(e.id) as last_id'),
      )
      // Most recent activity first; on the same day, the category whose expense was added last.
      .orderBy([
        { column: 'last_spent_on', order: 'desc' },
        { column: 'last_id', order: 'desc' },
      ])
      .limit(limit)
      .offset((page - 1) * limit),
    filteredExpenses(workspace, filters).countDistinct('e.category_name as total').first(),
    filteredExpenses(workspace, filters).first(
      db.raw('COALESCE(SUM(e.amount), 0) as spent'),
      db.raw('COUNT(*) as count'),
    ),
    filteredExpenses(workspace, filters).orderBy('e.amount', 'desc').first('e.amount', 'e.description', 'e.category_name'),
    // The chart always shows the whole month, so picking a day doesn't hide the others.
    filteredExpenses(workspace, withoutDay)
      .groupBy('e.spent_on')
      .orderBy('e.spent_on')
      .select('e.spent_on as date', db.raw('SUM(e.amount) as total'), db.raw('COUNT(*) as count')),
    filteredExpenses(workspace, { month: filters.month }).first(db.raw('COALESCE(SUM(e.amount), 0) as spent')),
    plannedByCategory(workspace, filters),
  ]);

  return {
    totals: {
      spent: totals.spent,
      count: totals.count,
      monthSpent: month.spent,
      largest: largest
        ? { amount: largest.amount, description: largest.description, categoryName: largest.category_name }
        : null,
    },
    daily,
    categories: {
      items: groups.map((row) => ({
        categoryName: row.category_name,
        total: row.total,
        count: row.entries,
        lastSpentOn: row.last_spent_on,
        planned: planned.get(row.category_name) ?? 0,
      })),
      total: groupCount.total,
      page,
      limit,
    },
  };
}

const findExpense = (workspace, id) => expensesWithBudget(workspace).where('e.id', id).first();

/** Alerts only on the expense that crosses a line, so a channel isn't told the same thing repeatedly. */
async function notifyIfThresholdCrossed(workspace, expense) {
  if (!expense.budget_id) return;

  const item = await db('budget_items')
    .where({ budget_id: expense.budget_id, category_name: expense.category_name })
    .first();
  if (!item || item.amount <= 0) return;

  const { total } = await db('expenses')
    .where({ budget_id: expense.budget_id, category_name: expense.category_name })
    .first(db.raw('COALESCE(SUM(amount), 0) as total'));

  const before = ((total - expense.amount) / item.amount) * 100;
  const after = (total / item.amount) * 100;
  const crossed = [100, 80].find((line) => before < line && after >= line);
  if (crossed) {
    const month = dateToMonth(expense.spent_on);
    emitEvent(
      workspace,
      'budget.threshold',
      `Budget alert: ${expense.category_name} has reached ${Math.round(after)}% of the "${expense.budget_name}" budget for ${month}.`,
      { budget: expense.budget_name, category: expense.category_name, month, percentUsed: Math.round(after), threshold: crossed },
    );
  }
}

/** Used when a transaction creates an expense, so it triggers the same budget alerts. */
export async function notifyForExpense(workspace, expenseId) {
  const expense = await findExpense(workspace, expenseId);
  if (expense) await notifyIfThresholdCrossed(workspace, expense);
}

/** An expense mirrored from a transaction would drift out of sync if changed on its own. */
async function getEditableExpense(workspace, id) {
  const existing = await applyScope(db('expenses').where({ id }), workspace).first('id', 'transaction_id');
  if (!existing) throw notFound('Expense');
  if (existing.transaction_id) {
    throw new AppError('This expense comes from a transaction. Change or delete the transaction instead.', 409);
  }
  return existing;
}

export async function createExpense(workspace, { categoryName, amount, description, spentOn, budgetId }) {
  const [id] = await db('expenses').insert({
    ...scopeColumns(workspace),
    budget_id: await resolveExpenseBudget(workspace, spentOn, budgetId),
    category_name: categoryName,
    amount,
    description,
    spent_on: spentOn,
  });
  const expense = await findExpense(workspace, id);

  emitEvent(workspace, 'expense.created', `New expense: ${amount} in ${categoryName}.`, present(expense));
  // Alerts are best-effort: the expense is already saved, so a failure here only costs one alert.
  notifyIfThresholdCrossed(workspace, expense).catch((error) => {
    logger.error({ err: error }, 'Could not check the budget threshold');
  });

  return present(expense);
}

/**
 * Several expenses from one receipt, split by category. They share a date and a
 * budget, and are saved together or not at all, so a receipt is never half recorded.
 */
export async function createExpenses(workspace, { spentOn, budgetId, items }) {
  const budget = await resolveExpenseBudget(workspace, spentOn, budgetId);
  const ids = await db.transaction(async (trx) => {
    const created = [];
    for (const item of items) {
      const [id] = await trx('expenses').insert({
        ...scopeColumns(workspace),
        budget_id: budget,
        category_name: item.categoryName,
        amount: item.amount,
        description: item.description,
        spent_on: spentOn,
      });
      created.push(id);
    }
    return created;
  });

  const saved = [];
  // One at a time, so each threshold check sees the expenses saved before it.
  for (const id of ids) {
    const expense = await findExpense(workspace, id);
    emitEvent(workspace, 'expense.created', `New expense: ${expense.amount} in ${expense.category_name}.`, present(expense));
    await notifyIfThresholdCrossed(workspace, expense).catch((error) => {
      logger.error({ err: error }, 'Could not check the budget threshold');
    });
    saved.push(present(expense));
  }
  return saved;
}

export async function updateExpense(workspace, id, { categoryName, amount, description, spentOn, budgetId }) {
  await getEditableExpense(workspace, id);

  await db('expenses').where({ id }).update({
    budget_id: await resolveExpenseBudget(workspace, spentOn, budgetId),
    category_name: categoryName,
    amount,
    description,
    spent_on: spentOn,
  });
  return present(await findExpense(workspace, id));
}

export async function deleteExpense(workspace, id) {
  await getEditableExpense(workspace, id);
  await db('expenses').where({ id }).delete();
}
