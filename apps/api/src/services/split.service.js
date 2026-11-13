import { db } from '../db/knex.js';
import { AppError, forbidden, notFound } from '../utils/errors.js';
import { addMoney, allocate } from '../utils/split.js';

export async function listContacts(userId) {
  return db('split_contacts as c')
    .join('users as u', 'u.id', 'c.contact_user_id')
    .where('c.owner_id', userId)
    .orderBy('u.username')
    .select('c.id', 'u.username');
}

export async function addContact(user, username) {
  const contact = await db('users').where({ username }).first('id');
  if (!contact) throw new AppError('No user has that username', 404);
  if (contact.id === user.id) throw new AppError("You can't add yourself");
  await db('split_contacts').insert({ owner_id: user.id, contact_user_id: contact.id });
}

export async function deleteContact(userId, id) {
  const removed = await db('split_contacts').where({ id, owner_id: userId }).delete();
  if (!removed) throw notFound('Contact');
}

export async function listGroups(userId) {
  const groups = await db('split_group_members as mine')
    .join('split_groups as g', 'g.id', 'mine.group_id')
    .join('users as creator', 'creator.id', 'g.created_by')
    .where('mine.user_id', userId)
    .orderBy('g.id', 'desc')
    .select(
      'g.id',
      'g.name',
      'g.created_by',
      'mine.balance',
      'creator.username as creator_name',
      db.raw('(SELECT COUNT(*) FROM split_group_members m WHERE m.group_id = g.id) as member_count'),
    );

  return groups.map((group) => ({
    id: group.id,
    name: group.name,
    creatorName: group.creator_name,
    isCreator: group.created_by === userId,
    memberCount: group.member_count,
    myBalance: group.balance,
  }));
}

export async function createGroup(user, { name, members }) {
  const contacts = await db('split_contacts as c')
    .join('users as u', 'u.id', 'c.contact_user_id')
    .where('c.owner_id', user.id)
    .whereIn('u.username', members)
    .select('u.id');
  if (contacts.length !== new Set(members).size) {
    throw new AppError('Group members must be in your contacts');
  }

  await db.transaction(async (trx) => {
    const [groupId] = await trx('split_groups').insert({ name, created_by: user.id });
    await trx('split_group_members').insert(
      [user.id, ...contacts.map((contact) => contact.id)].map((userId) => ({ group_id: groupId, user_id: userId })),
    );
  });
}

async function assertMember(queryable, groupId, userId) {
  const member = await queryable('split_group_members').where({ group_id: groupId, user_id: userId }).first();
  if (!member) throw notFound('Group');
  return member;
}

export async function getGroup(user, groupId) {
  await assertMember(db, groupId, user.id);
  const [group, members, activity] = await Promise.all([
    db('split_groups').where({ id: groupId }).first(),
    db('split_group_members as m')
      .join('users as u', 'u.id', 'm.user_id')
      .where('m.group_id', groupId)
      .orderBy('m.id')
      .select('m.id', 'm.user_id', 'm.balance', 'u.username'),
    db('split_activity').where({ group_id: groupId }).orderBy('id', 'desc').limit(100),
  ]);

  return {
    id: group.id,
    name: group.name,
    isCreator: group.created_by === user.id,
    members: members.map((member) => ({
      id: member.id,
      username: member.username,
      balance: member.balance,
      isMe: member.user_id === user.id,
    })),
    activity: activity.map((entry) => ({
      id: entry.id,
      description: entry.description,
      createdAt: entry.created_at,
    })),
  };
}

export async function deleteGroup(userId, groupId) {
  const group = await db('split_groups').where({ id: groupId }).first();
  await assertMember(db, groupId, userId);
  if (group.created_by !== userId) throw forbidden('Only the person who created a group can delete it');
  await db('split_groups').where({ id: groupId }).delete();
}

export async function addBill(user, groupId, { amount, mode }) {
  await db.transaction(async (trx) => {
    await assertMember(trx, groupId, user.id);
    // Row locks stop two bills added at once from overwriting each other's totals.
    const members = await trx('split_group_members').where({ group_id: groupId }).orderBy('id').forUpdate();

    const sharing = mode === 'equal' ? members : members.filter((member) => member.user_id !== user.id);
    if (sharing.length === 0) throw new AppError('This group has no one to split with');

    const shares = allocate(amount, sharing.length);
    for (const [index, member] of sharing.entries()) {
      await trx('split_group_members')
        .where({ id: member.id })
        .update({ balance: addMoney(member.balance, shares[index]) });
    }

    const summary =
      mode === 'equal'
        ? `split equally between ${sharing.length} people`
        : `paid by them and split between ${sharing.length} people`;
    await trx('split_activity').insert({
      group_id: groupId,
      description: `${user.username} added a bill of ${amount.toFixed(2)}, ${summary} (${shares[0].toFixed(2)} each)`,
    });
  });
}

export async function settle(user, groupId, amount) {
  await db.transaction(async (trx) => {
    await assertMember(trx, groupId, user.id);
    const member = await trx('split_group_members').where({ group_id: groupId, user_id: user.id }).forUpdate().first();
    if (member.balance <= 0) throw new AppError('You have nothing to settle in this group');
    if (amount > member.balance) throw new AppError('That is more than you owe');

    await trx('split_group_members').where({ id: member.id }).update({ balance: addMoney(member.balance, -amount) });
    await trx('split_activity').insert({
      group_id: groupId,
      description: `${user.username} paid ${amount.toFixed(2)} of their share`,
    });
  });
}
