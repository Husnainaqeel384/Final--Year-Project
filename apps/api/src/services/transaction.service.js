import { logger } from '../config/logger.js';
import { db } from '../db/knex.js';
import { AppError, notFound } from '../utils/errors.js';
import { monthRange } from '../utils/months.js';
import { applyScope, scopeColumns } from '../utils/scope.js';
import { resolveExpenseBudget } from './budget.service.js';
import { notifyForExpense } from './expense.service.js';
import { emitEvent } from './webhook.service.js';

export const presentTransaction = (row) => ({
  id: row.id,
  type: row.type,
  date: row.date,
  amount: row.amount,
  sender: row.sender,
  receiver: row.receiver,
  method: row.method,
  description: row.description,
  budgetId: row.budget_id ?? null,
  budgetName: row.budget_name ?? null,
  categoryName: row.category_name ?? null,
});

/** Transactions with the name of the budget they're linked to. */
const transactionsWithBudget = (workspace) =>
  applyScope(db('transactions as t'), workspace, 't')
    .leftJoin('budgets as b', 'b.id', 't.budget_id')
    .select('t.*', 'b.name as budget_name');

const findTransaction = (workspace, id) => transactionsWithBudget(workspace).where('t.id', id).first();

function applyFilters(query, { month, type, budget, search }) {
  if (month) {
    const [start, end] = monthRange(month);
    query.where('t.date', '>=', start).where('t.date', '<', end);
  }
  if (type) query.where('t.type', type);
  if (budget === 'none') query.whereNull('t.budget_id');
  else if (budget) query.where('t.budget_id', budget);
  if (search) {
    // % and _ are wildcards in LIKE; escaped so a search for "50%" means exactly that.
    const term = `%${search.replace(/[\\%_]/g, '\\$&')}%`;
    // Plain LIKE: knex's whereLike forces a binary collation MySQL rejects for utf8mb4 columns.
    query.where((inner) =>
      inner
        .where('t.sender', 'like', term)
        .orWhere('t.receiver', 'like', term)
        .orWhere('t.method', 'like', term)
        .orWhere('t.description', 'like', term)
        .orWhere('t.category_name', 'like', term),
    );
  }
  return query;
}

const filtered = (workspace, filters) =>
  applyScope(db('transactions as t'), workspace, 't').modify((query) => applyFilters(query, filters));

export async function listTransactions(workspace, { page, limit, ...filters }) {
  // Totals ignore the type filter, so the money-in/money-out figures stay visible on every tab.
  const { type: _type, ...withoutType } = filters;

  const [rows, { total }, byType] = await Promise.all([
    transactionsWithBudget(workspace)
      .modify((query) => applyFilters(query, filters))
      .orderBy([{ column: 't.date', order: 'desc' }, { column: 't.id', order: 'desc' }])
      .limit(limit)
      .offset((page - 1) * limit),
    filtered(workspace, filters).count('* as total').first(),
    filtered(workspace, withoutType)
      .groupBy('t.type')
      .select('t.type', db.raw('SUM(t.amount) as total'), db.raw('COUNT(*) as count')),
  ]);

  const totals = { received: 0, sent: 0, pending: 0 };
  const counts = { received: 0, sent: 0, pending: 0 };
  for (const row of byType) {
    totals[row.type] = row.total;
    counts[row.type] = row.count;
  }

  return {
    items: rows.map(presentTransaction),
    total,
    page,
    limit,
    totals: { ...totals, net: Math.round((totals.received - totals.sent) * 100) / 100 },
    counts,
  };
}

/**
 * Checks the budget link and decides what to store. The budget must be in this
 * workspace and cover the transaction's month. Money going out needs a category
 * so it counts against the right limit; money coming in doesn't use one.
 */
async function resolveLink(workspace, { type, date, budgetId, categoryName }) {
  const category = categoryName?.trim() || null;
  if (!budgetId) return { budget_id: null, category_name: type === 'received' ? null : category };

  const id = await resolveExpenseBudget(workspace, date, budgetId);
  if (type !== 'received' && !category) {
    throw new AppError('Choose a category so the payment counts against the right limit');
  }
  return { budget_id: id, category_name: type === 'received' ? null : category };
}

/**
 * Keeps the mirrored expense in step with its transaction. Only money that has
 * actually gone out, with a budget and category, counts toward a budget.
 * Returns the expense id when there is one.
 */
async function syncExpense(trx, transaction) {
  const counts = transaction.type === 'sent' && transaction.budget_id && transaction.category_name;
  const existing = await trx('expenses').where({ transaction_id: transaction.id }).first('id');

  if (!counts) {
    if (existing) await trx('expenses').where({ id: existing.id }).delete();
    return null;
  }

  const values = {
    user_id: transaction.user_id,
    organization_id: transaction.organization_id,
    budget_id: transaction.budget_id,
    category_name: transaction.category_name,
    amount: transaction.amount,
    spent_on: transaction.date,
    description: transaction.description || `Paid to ${transaction.receiver}`,
  };
  if (existing) {
    await trx('expenses').where({ id: existing.id }).update(values);
    return existing.id;
  }
  const [id] = await trx('expenses').insert({ ...values, transaction_id: transaction.id });
  return id;
}

function columnsFrom(input) {
  return {
    type: input.type,
    date: input.date,
    amount: input.amount,
    sender: input.sender,
    receiver: input.receiver,
    method: input.method,
    description: input.description,
  };
}

/**
 * Inserts a transaction and its mirrored expense inside the caller's database
 * transaction, so a feature like paying a reminder can save everything or nothing.
 * Call `announceTransaction` once the outer transaction has committed.
 */
export async function insertTransaction(trx, workspace, input) {
  const link = await resolveLink(workspace, input);
  const [id] = await trx('transactions').insert({ ...scopeColumns(workspace), ...columnsFrom(input), ...link });
  const row = await trx('transactions').where({ id }).first();
  return { id, expenseId: await syncExpense(trx, row) };
}

export async function createTransaction(workspace, input) {
  const { id, expenseId } = await db.transaction((trx) => insertTransaction(trx, workspace, input));
  return announceTransaction(workspace, id, expenseId);
}

/** Webhooks and budget alerts for a saved transaction. Both are best-effort. */
export async function announceTransaction(workspace, id, expenseId) {
  const created = presentTransaction(await findTransaction(workspace, id));
  emitEvent(
    workspace,
    'transaction.created',
    `New ${created.type} transaction: ${created.amount} from ${created.sender} to ${created.receiver}.`,
    created,
  );
  if (expenseId) {
    // Best-effort, like any other alert: the transaction is already saved.
    notifyForExpense(workspace, expenseId).catch((error) => {
      logger.error({ err: error }, 'Could not check the budget threshold');
    });
  }
  return created;
}

export async function updateTransaction(workspace, id, input) {
  const existing = await applyScope(db('transactions').where({ id }), workspace).first('id');
  if (!existing) throw notFound('Transaction');
  const link = await resolveLink(workspace, input);

  await db.transaction(async (trx) => {
    await trx('transactions').where({ id }).update({ ...columnsFrom(input), ...link });
    await syncExpense(trx, await trx('transactions').where({ id }).first());
  });
  return presentTransaction(await findTransaction(workspace, id));
}

/** Its mirrored expense goes with it, through the foreign key. */
export async function deleteTransaction(workspace, id) {
  const removed = await applyScope(db('transactions').where({ id }), workspace).delete();
  if (!removed) throw notFound('Transaction');
}
