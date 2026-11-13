import { db } from '../db/knex.js';
import { AppError, notFound } from '../utils/errors.js';

// Personal rows have no organization to belong to, so they go with their owner.
const PERSONAL_TABLES = ['budgets', 'expenses', 'transactions', 'reminders', 'notes', 'webhooks'];

export function listUsers() {
  return db('users')
    .orderBy('id')
    .select('id', 'first_name as firstName', 'last_name as lastName', 'username', 'email', 'role', 'created_at as createdAt');
}

export async function updateUserRole(actor, id, role) {
  if (id === actor.id) throw new AppError("You can't change your own role");
  const updated = await db('users').where({ id }).update({ role, token_version: db.raw('token_version + 1') });
  if (!updated) throw notFound('User');
}

/** Hands an owned organization to its next most senior member so the team keeps its data. */
async function transferOrDeleteOrganizations(trx, userId) {
  const owned = await trx('organizations').where({ owner_id: userId }).select('id');

  for (const { id } of owned) {
    const successor = await trx('organization_members')
      .where({ organization_id: id })
      .whereNot({ user_id: userId })
      .orderByRaw("FIELD(role, 'admin', 'member')")
      .orderBy('created_at')
      .first('user_id');

    if (successor) {
      await trx('organizations').where({ id }).update({ owner_id: successor.user_id });
      await trx('organization_members').where({ organization_id: id, user_id: successor.user_id }).update({ role: 'owner' });
    } else {
      await trx('organizations').where({ id }).delete();
    }
  }
}

export async function deleteUser(actor, id) {
  if (id === actor.id) throw new AppError("You can't delete your own account here");

  await db.transaction(async (trx) => {
    const user = await trx('users').where({ id }).forUpdate().first('id');
    if (!user) throw notFound('User');

    await transferOrDeleteOrganizations(trx, id);
    for (const table of PERSONAL_TABLES) {
      await trx(table).where({ user_id: id }).whereNull('organization_id').delete();
    }
    await trx('users').where({ id }).delete();
  });
}
