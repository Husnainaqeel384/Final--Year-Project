import { db } from '../db/knex.js';
import { AppError, notFound } from '../utils/errors.js';
import { dateToMonth, monthRange, monthToDate } from '../utils/months.js';
import { applyScope, scopeColumns, scopeKey } from '../utils/scope.js';

const round = (value) => Math.round(value * 100) / 100;

export function presentItem(item, spent) {
  const planned = item.amount;
  return {
    id: item.id,
    categoryName: item.category_name,
    amount: planned,
    spent: round(spent),
    remaining: round(planned - spent),
    percentUsed: planned > 0 ? round((spent / planned) * 100) : 0,
  };
}

/** Totals and expense counts per category for every expense in a month, budgeted or not. */
export function categorySpendRows(workspace, month) {
  const [start, end] = monthRange(month);
  return applyScope(db('expenses'), workspace)
    .where('spent_on', '>=', start)
    .where('spent_on', '<', end)
    .groupBy('category_name')
    .select('category_name', db.raw('SUM(amount) as total'), db.raw('COUNT(*) as entries'));
}

export function budgetsForMonth(workspace, month) {
  return applyScope(db('budgets'), workspace).where({ month: monthToDate(month) }).orderBy('name');
}

async function getOwnedBudget(workspace, id) {
  const budget = await applyScope(db('budgets').where({ id }), workspace).first();
  if (!budget) throw notFound('Budget');
  return budget;
}

/** Names are what tells budgets apart within a month, so they must be unique there. */
async function assertNameAvailable(workspace, { name, month }, exceptId) {
  const clash = await budgetsForMonth(workspace, month)
    .whereRaw('LOWER(name) = ?', [name.toLowerCase()])
    .modify((query) => {
      if (exceptId) query.whereNot({ id: exceptId });
    })
    .first('id');
  if (clash) throw new AppError(`You already have a budget called "${name}" for that month`, 409);
}

/** Years that have at least one budget, newest first, for the year picker. */
export async function listBudgetYears(workspace) {
  const rows = await applyScope(db('budgets'), workspace)
    .distinct(db.raw('YEAR(month) as year'))
    .orderBy('year', 'desc');
  return rows.map((row) => row.year);
}

export async function listBudgets(workspace, { month, year } = {}) {
  const budgets = await applyScope(db('budgets'), workspace)
    .modify((query) => {
      if (month) query.where({ month: monthToDate(month) });
      if (year) query.whereBetween('month', [`${year}-01-01`, `${year}-12-01`]);
    })
    .orderBy([{ column: 'month', order: 'desc' }, { column: 'name' }]);
  if (budgets.length === 0) return [];

  const ids = budgets.map((budget) => budget.id);
  const [plans, spends] = await Promise.all([
    db('budget_items')
      .whereIn('budget_id', ids)
      .groupBy('budget_id')
      .select('budget_id', db.raw('SUM(amount) as total'), db.raw('COUNT(*) as items')),
    db('expenses').whereIn('budget_id', ids).groupBy('budget_id').select('budget_id', db.raw('SUM(amount) as total')),
  ]);
  const planned = new Map(plans.map((row) => [row.budget_id, row]));
  const spent = new Map(spends.map((row) => [row.budget_id, row.total]));

  return budgets.map((budget) => ({
    id: budget.id,
    name: budget.name,
    month: dateToMonth(budget.month),
    income: budget.income,
    savingsGoal: budget.savings_goal,
    planned: planned.get(budget.id)?.total ?? 0,
    itemCount: planned.get(budget.id)?.items ?? 0,
    spent: spent.get(budget.id) ?? 0,
  }));
}

export async function getBudget(workspace, id) {
  const budget = await getOwnedBudget(workspace, id);
  const [items, spendRows, recent, received] = await Promise.all([
    db('budget_items').where({ budget_id: budget.id }).orderBy('category_name'),
    db('expenses')
      .where({ budget_id: budget.id })
      .groupBy('category_name')
      .select('category_name', db.raw('SUM(amount) as total')),
    db('expenses')
      .where({ budget_id: budget.id })
      .orderBy([{ column: 'spent_on', order: 'desc' }, { column: 'id', order: 'desc' }])
      .limit(6),
    // Money in from "received" transactions linked to this budget.
    db('transactions')
      .where({ budget_id: budget.id, type: 'received' })
      .first(db.raw('COALESCE(SUM(amount), 0) as total'), db.raw('COUNT(*) as count')),
  ]);
  const spending = new Map(spendRows.map((row) => [row.category_name, row.total]));
  const planNames = new Set(items.map((item) => item.category_name));
  const presented = items.map((item) => presentItem(item, spending.get(item.category_name) ?? 0));

  return {
    id: budget.id,
    name: budget.name,
    month: dateToMonth(budget.month),
    income: budget.income,
    incomeReceived: received.total,
    incomeReceivedCount: received.count,
    savingsGoal: budget.savings_goal,
    planned: round(presented.reduce((sum, item) => sum + item.amount, 0)),
    spent: round(spendRows.reduce((sum, row) => sum + row.total, 0)),
    items: presented,
    // Spending assigned to this budget in categories it doesn't plan for, so nothing is hidden.
    unplanned: spendRows
      .filter((row) => !planNames.has(row.category_name))
      .map((row) => ({ categoryName: row.category_name, spent: row.total })),
    recentExpenses: recent.map((row) => ({
      id: row.id,
      transactionId: row.transaction_id ?? null,
      categoryName: row.category_name,
      amount: row.amount,
      description: row.description,
      spentOn: row.spent_on,
    })),
  };
}

export async function createBudget(workspace, { name, month, income, savingsGoal, copyFromId }) {
  await assertNameAvailable(workspace, { name, month });
  const template = copyFromId ? await getOwnedBudget(workspace, copyFromId) : null;
  const isFirstForMonth = !(await budgetsForMonth(workspace, month).first('id'));

  const id = await db.transaction(async (trx) => {
    const [budgetId] = await trx('budgets').insert({
      ...scopeColumns(workspace),
      scope_key: scopeKey(workspace),
      name,
      month: monthToDate(month),
      income,
      savings_goal: savingsGoal,
    });

    if (template) {
      const items = await trx('budget_items').where({ budget_id: template.id });
      if (items.length > 0) {
        await trx('budget_items').insert(
          items.map((item) => ({ budget_id: budgetId, category_name: item.category_name, amount: item.amount })),
        );
      }
    }

    // Expenses logged before the month had any budget would otherwise count toward nothing.
    if (isFirstForMonth) {
      const [start, end] = monthRange(month);
      await applyScope(trx('expenses'), workspace)
        .whereNull('budget_id')
        .where('spent_on', '>=', start)
        .where('spent_on', '<', end)
        .update({ budget_id: budgetId });
    }
    return budgetId;
  });

  return { id };
}

export async function updateBudget(workspace, id, { name, income, savingsGoal }) {
  const budget = await getOwnedBudget(workspace, id);
  await assertNameAvailable(workspace, { name, month: dateToMonth(budget.month) }, budget.id);
  await db('budgets').where({ id: budget.id }).update({ name, income, savings_goal: savingsGoal });
  return getBudget(workspace, id);
}

/** Expenses are kept: the foreign key simply clears their budget. */
export async function deleteBudget(workspace, id) {
  const budget = await getOwnedBudget(workspace, id);
  await db('budgets').where({ id: budget.id }).delete();
}

export async function addItems(workspace, id, items) {
  const budget = await getOwnedBudget(workspace, id);
  const names = items.map((item) => item.categoryName);
  if (new Set(names).size !== names.length) throw new AppError('A category can only be added once');

  const existing = await db('budget_items').where({ budget_id: budget.id }).whereIn('category_name', names).first('category_name');
  if (existing) throw new AppError(`${existing.category_name} is already in this budget`, 409);

  await db('budget_items').insert(
    items.map((item) => ({ budget_id: budget.id, category_name: item.categoryName, amount: item.amount })),
  );
  return getBudget(workspace, id);
}

export async function updateItem(workspace, id, itemId, amount) {
  const budget = await getOwnedBudget(workspace, id);
  const updated = await db('budget_items').where({ id: itemId, budget_id: budget.id }).update({ amount });
  if (!updated) throw notFound('Category');
  return getBudget(workspace, id);
}

export async function deleteItem(workspace, id, itemId) {
  const budget = await getOwnedBudget(workspace, id);
  const removed = await db('budget_items').where({ id: itemId, budget_id: budget.id }).delete();
  if (!removed) throw notFound('Category');
}

/**
 * Works out which budget an expense belongs to.
 * - A number: that budget, which must be yours and cover the expense's month.
 * - null: deliberately not assigned.
 * - Not given (imports, older clients): the month's budget if there is exactly one.
 */
export async function resolveExpenseBudget(workspace, spentOn, budgetId) {
  const month = dateToMonth(spentOn);

  if (budgetId) {
    const budget = await getOwnedBudget(workspace, budgetId);
    if (dateToMonth(budget.month) !== month) {
      throw new AppError(`The expense date must be in ${month} to use the "${budget.name}" budget`);
    }
    return budget.id;
  }
  if (budgetId === null) return null;

  const candidates = await budgetsForMonth(workspace, month).limit(2).pluck('id');
  return candidates.length === 1 ? candidates[0] : null;
}
