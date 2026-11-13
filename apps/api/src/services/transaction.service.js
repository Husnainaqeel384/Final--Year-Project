import { db } from '../db/knex.js';
import { notFound } from '../utils/errors.js';
import { applyScope, scopeColumns } from '../utils/scope.js';
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
});

export async function listTransactions(workspace, { search, type, page, limit }) {
  const filtered = applyScope(db('transactions'), workspace).modify((query) => {
    if (type) query.where({ type });
    if (search) {
      // % and _ are wildcards in LIKE; escaped so a search for "50%" means exactly that.
      const term = `%${search.replace(/[\\%_]/g, '\\$&')}%`;
      query.where((inner) =>
        inner
          // Plain LIKE: knex's whereLike forces a binary collation MySQL rejects for utf8mb4 columns.
          .where('sender', 'like', term)
          .orWhere('receiver', 'like', term)
          .orWhere('method', 'like', term)
          .orWhere('description', 'like', term),
      );
    }
  });

  const [{ total }, rows] = await Promise.all([
    filtered.clone().count('* as total').first(),
    filtered
      .clone()
      .orderBy([{ column: 'date', order: 'desc' }, { column: 'id', order: 'desc' }])
      .limit(limit)
      .offset((page - 1) * limit),
  ]);

  return { items: rows.map(presentTransaction), total };
}

export async function createTransaction(workspace, input) {
  const [id] = await db('transactions').insert({ ...scopeColumns(workspace), ...input });
  const created = presentTransaction(await db('transactions').where({ id }).first());
  emitEvent(
    workspace,
    'transaction.created',
    `New ${input.type} transaction: ${input.amount} from ${input.sender} to ${input.receiver}.`,
    created,
  );
  return created;
}

export async function updateTransaction(workspace, id, input) {
  const scoped = () => applyScope(db('transactions').where({ id }), workspace);
  const updated = await scoped().update(input);
  if (!updated && !(await scoped().first('id'))) throw notFound('Transaction');
  return presentTransaction(await scoped().first());
}

export async function deleteTransaction(workspace, id) {
  const removed = await applyScope(db('transactions').where({ id }), workspace).delete();
  if (!removed) throw notFound('Transaction');
}
