import { db } from '../db/knex.js';
import { AppError, notFound } from '../utils/errors.js';
import { monthRange } from '../utils/months.js';
import { applyScope, scopeColumns } from '../utils/scope.js';
import { announceTransaction, insertTransaction } from './transaction.service.js';

const REPEATING = new Set(['weekly', 'monthly', 'yearly']);

export const presentReminder = (row) => ({
  id: row.id,
  title: row.title,
  amount: row.amount,
  categoryName: row.category_name ?? null,
  dueDate: row.due_date,
  frequency: row.frequency,
  anchorDay: row.anchor_day ?? null,
  note: row.note ?? '',
  status: row.status,
  completedOn: row.completed_on ?? null,
  transactionId: row.transaction_id ?? null,
  paidAmount: row.paid_amount ?? null,
  budgetId: row.budget_id ?? null,
  budgetName: row.budget_name ?? null,
});

/** Reminders with the payment that settled them and the budget it went to. */
const withPayment = (workspace) =>
  applyScope(db('reminders as r'), workspace, 'r')
    .leftJoin('transactions as t', 't.id', 'r.transaction_id')
    .leftJoin('budgets as b', 'b.id', 't.budget_id')
    .select('r.*', 't.amount as paid_amount', 't.budget_id', 'b.name as budget_name');

const findReminder = async (workspace, id) => {
  const row = await withPayment(workspace).where('r.id', id).first();
  return row ? presentReminder(row) : null;
};

const isoDate = (date) => date.toISOString().slice(0, 10);

const addDays = (value, days) => {
  const [year, month, day] = value.split('-').map(Number);
  return isoDate(new Date(Date.UTC(year, month - 1, day + days)));
};

/**
 * The next date in a repeating series. Monthly and yearly dates aim for the
 * anchor day and fall back to the month's last day, so "the 31st" means the
 * 31st whenever the month has one.
 */
export function nextDueDate(dueDate, frequency, anchorDay) {
  if (frequency === 'weekly') return addDays(dueDate, 7);
  const [year, month, day] = dueDate.split('-').map(Number);
  const target = new Date(Date.UTC(year, month - 1 + (frequency === 'yearly' ? 12 : 1), 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(anchorDay || day, lastDay));
  return isoDate(target);
}

const anchorFor = (dueDate, frequency) =>
  frequency === 'monthly' || frequency === 'yearly' ? Number(dueDate.slice(8, 10)) : null;

function applyFilters(query, { status, search }) {
  query.where('r.status', status === 'done' ? 'done' : 'pending');
  if (search) {
    // % and _ are LIKE wildcards; escaped so the search means exactly what was typed.
    const term = `%${search.replace(/[\\%_]/g, '\\$&')}%`;
    // Plain LIKE: knex's whereLike forces a binary collation MySQL rejects for utf8mb4 columns.
    query.where((inner) =>
      inner.where('r.title', 'like', term).orWhere('r.note', 'like', term).orWhere('r.category_name', 'like', term),
    );
  }
  return query;
}

/**
 * Open reminders soonest first, done ones most recent first, plus the figures
 * for the summary. `today` comes from the browser so "overdue" matches the
 * user's own calendar day rather than the server's time zone.
 */
export async function listReminders(workspace, { status, search, page, limit, today }) {
  const weekEnd = addDays(today, 7);
  const monthEnd = addDays(today, 30);
  const [monthStart, nextMonth] = monthRange(today.slice(0, 7));

  const order =
    status === 'done'
      ? [{ column: 'r.completed_on', order: 'desc' }, { column: 'r.id', order: 'desc' }]
      : [{ column: 'r.due_date', order: 'asc' }, { column: 'r.id', order: 'asc' }];

  const [rows, { total }, summary] = await Promise.all([
    withPayment(workspace)
      .modify((query) => applyFilters(query, { status, search }))
      .orderBy(order)
      .limit(limit)
      .offset((page - 1) * limit),
    applyScope(db('reminders as r'), workspace, 'r')
      .modify((query) => applyFilters(query, { status, search }))
      .count('* as total')
      .first(),
    // One pass over the workspace's reminders; the summary ignores the search so it stays steady while typing.
    applyScope(db('reminders as r'), workspace, 'r')
      .leftJoin('transactions as t', 't.id', 'r.transaction_id')
      .first(
        db.raw("SUM(r.status = 'pending') as open_count"),
        db.raw("SUM(r.status = 'done') as done_count"),
        db.raw("SUM(r.status = 'pending' AND r.due_date < ?) as overdue_count", [today]),
        db.raw("SUM(CASE WHEN r.status = 'pending' AND r.due_date < ? THEN r.amount END) as overdue_amount", [today]),
        db.raw("SUM(r.status = 'pending' AND r.due_date >= ? AND r.due_date < ?) as week_count", [today, weekEnd]),
        db.raw("SUM(CASE WHEN r.status = 'pending' AND r.due_date >= ? AND r.due_date < ? THEN r.amount END) as week_amount", [today, weekEnd]),
        db.raw("SUM(r.status = 'pending' AND r.due_date >= ? AND r.due_date < ?) as month_count", [today, monthEnd]),
        db.raw("SUM(CASE WHEN r.status = 'pending' AND r.due_date >= ? AND r.due_date < ? THEN r.amount END) as month_amount", [today, monthEnd]),
        db.raw("SUM(r.status = 'done' AND r.completed_on >= ? AND r.completed_on < ?) as paid_count", [monthStart, nextMonth]),
        // The payment's amount wins over the reminder's estimate: it is what actually left the account.
        db.raw(
          "SUM(CASE WHEN r.status = 'done' AND r.completed_on >= ? AND r.completed_on < ? THEN COALESCE(t.amount, r.amount) END) as paid_amount",
          [monthStart, nextMonth],
        ),
      ),
  ]);

  const figure = (prefix) => ({ count: Number(summary[`${prefix}_count`] ?? 0), amount: Number(summary[`${prefix}_amount`] ?? 0) });
  return {
    items: rows.map(presentReminder),
    total,
    page,
    limit,
    counts: { open: Number(summary.open_count ?? 0), done: Number(summary.done_count ?? 0) },
    summary: { overdue: figure('overdue'), week: figure('week'), month: figure('month'), paid: figure('paid') },
  };
}

/** How many days ahead a reminder starts asking for attention. */
export const ALERT_DAYS = 3;

/**
 * What needs attention now: open reminders that are overdue or due within
 * ALERT_DAYS. Nothing is stored. Paying or completing a reminder is what
 * clears its alert, so the bell can never disagree with the list.
 */
export async function listAlerts(workspace, { today, limit = 6 }) {
  const until = addDays(today, ALERT_DAYS);
  const due = (query) => query.where('r.status', 'pending').where('r.due_date', '<=', until);

  const [rows, totals] = await Promise.all([
    due(withPayment(workspace))
      .orderBy([{ column: 'r.due_date', order: 'asc' }, { column: 'r.id', order: 'asc' }])
      .limit(limit),
    due(applyScope(db('reminders as r'), workspace, 'r')).first(
      db.raw('SUM(r.due_date < ?) as overdue_count', [today]),
      db.raw('SUM(CASE WHEN r.due_date < ? THEN r.amount END) as overdue_amount', [today]),
      db.raw('SUM(r.due_date >= ?) as soon_count', [today]),
      db.raw('SUM(CASE WHEN r.due_date >= ? THEN r.amount END) as soon_amount', [today]),
    ),
  ]);

  const overdue = { count: Number(totals.overdue_count ?? 0), amount: Number(totals.overdue_amount ?? 0) };
  const soon = { count: Number(totals.soon_count ?? 0), amount: Number(totals.soon_amount ?? 0) };
  return { items: rows.map(presentReminder), total: overdue.count + soon.count, overdue, soon, windowDays: ALERT_DAYS };
}

const columnsFrom = (input) => ({
  ...(input.title !== undefined && { title: input.title }),
  ...(input.amount !== undefined && { amount: input.amount }),
  ...(input.categoryName !== undefined && { category_name: input.categoryName?.trim() || null }),
  ...(input.note !== undefined && { note: input.note || null }),
});

export async function createReminder(workspace, input) {
  const frequency = input.frequency ?? 'none';
  const [id] = await db('reminders').insert({
    ...scopeColumns(workspace),
    ...columnsFrom(input),
    due_date: input.dueDate,
    frequency,
    anchor_day: anchorFor(input.dueDate, frequency),
  });
  return findReminder(workspace, id);
}

const scoped = (workspace, id) => applyScope(db('reminders').where({ id }), workspace);

export async function updateReminder(workspace, id, input) {
  const existing = await scoped(workspace, id).first();
  if (!existing) throw notFound('Reminder');

  const dueDate = input.dueDate ?? existing.due_date;
  const frequency = input.frequency ?? existing.frequency;
  // Spread conditionally: knex rejects undefined values in an update.
  await scoped(workspace, id).update({
    ...columnsFrom(input),
    due_date: dueDate,
    frequency,
    anchor_day: anchorFor(dueDate, frequency),
    updated_at: db.fn.now(),
  });
  return findReminder(workspace, id);
}

/**
 * Marks a reminder done, optionally records the payment as a "sent"
 * transaction (which counts in a budget like any other), and opens the next
 * reminder of a repeating series. All of it saves together or not at all.
 */
export async function completeReminder(workspace, id, { completedOn, payment, payer }) {
  const reminder = await scoped(workspace, id).first();
  if (!reminder) throw notFound('Reminder');
  if (reminder.status === 'done') throw new AppError('This reminder is already done', 409);

  const result = await db.transaction(async (trx) => {
    let paid = null;
    if (payment) {
      paid = await insertTransaction(trx, workspace, {
        type: 'sent',
        date: completedOn,
        amount: payment.amount,
        sender: payer,
        receiver: payment.paidTo,
        method: payment.method,
        description: reminder.title,
        budgetId: payment.budgetId ?? null,
        categoryName: payment.categoryName ?? null,
      });
    }

    await trx('reminders')
      .where({ id })
      .update({ status: 'done', completed_on: completedOn, transaction_id: paid?.id ?? null, updated_at: db.fn.now() });

    let nextId = null;
    if (REPEATING.has(reminder.frequency)) {
      [nextId] = await trx('reminders').insert({
        user_id: reminder.user_id,
        organization_id: reminder.organization_id,
        title: reminder.title,
        amount: reminder.amount,
        category_name: reminder.category_name,
        note: reminder.note,
        frequency: reminder.frequency,
        anchor_day: reminder.anchor_day,
        due_date: nextDueDate(reminder.due_date, reminder.frequency, reminder.anchor_day),
        previous_id: id,
      });
    }
    return { paid, nextId };
  });

  const transaction = result.paid
    ? await announceTransaction(workspace, result.paid.id, result.paid.expenseId)
    : null;
  return {
    reminder: await findReminder(workspace, id),
    next: result.nextId ? await findReminder(workspace, result.nextId) : null,
    transaction,
  };
}

/**
 * Undoes "done". The next reminder it opened is removed while still untouched,
 * so the series doesn't double up. The payment stays in Transactions: money
 * that moved is the owner's to delete, not a side effect of an undo.
 */
export async function reopenReminder(workspace, id) {
  const reminder = await scoped(workspace, id).first();
  if (!reminder) throw notFound('Reminder');
  if (reminder.status !== 'done') throw new AppError('This reminder is still open', 409);

  const next = await applyScope(db('reminders').where({ previous_id: id }), workspace).first('id', 'status');
  if (next?.status === 'done') {
    throw new AppError('The next reminder in this series is already done. Reopen that one first', 409);
  }

  await db.transaction(async (trx) => {
    if (next) await trx('reminders').where({ id: next.id }).delete();
    await trx('reminders')
      .where({ id })
      .update({ status: 'pending', completed_on: null, transaction_id: null, updated_at: db.fn.now() });
  });
  return { reminder: await findReminder(workspace, id), keptTransaction: Boolean(reminder.transaction_id) };
}

export async function deleteReminder(workspace, id) {
  const removed = await scoped(workspace, id).delete();
  if (!removed) throw notFound('Reminder');
}
