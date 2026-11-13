import { env } from '../config/env.js';
import { db } from '../db/knex.js';
import { AppError, forbidden, notFound } from '../utils/errors.js';
import { createOpaqueToken, hashToken } from '../utils/tokens.js';
import { actionEmail, isMailConfigured, sendMail } from './mail.service.js';

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MANAGER_ROLES = ['owner', 'admin'];

async function getMembership(organizationId, userId) {
  const membership = await db('organization_members').where({ organization_id: organizationId, user_id: userId }).first();
  // A non-member learns nothing about whether the organization exists.
  if (!membership) throw notFound('Organization');
  return membership;
}

async function assertManager(organizationId, userId) {
  const membership = await getMembership(organizationId, userId);
  if (!MANAGER_ROLES.includes(membership.role)) throw forbidden('Only owners and admins can do that');
  return membership;
}

export async function createOrganization(user, { name, currency }) {
  return db.transaction(async (trx) => {
    const [id] = await trx('organizations').insert({ name, currency, owner_id: user.id });
    await trx('organization_members').insert({ organization_id: id, user_id: user.id, role: 'owner' });
    return { id };
  });
}

export async function getOrganization(user, id) {
  const membership = await getMembership(id, user.id);
  const canManage = MANAGER_ROLES.includes(membership.role);
  const [organization, members, invitations] = await Promise.all([
    db('organizations').where({ id }).first(),
    db('organization_members as m')
      .join('users as u', 'u.id', 'm.user_id')
      .where('m.organization_id', id)
      .orderBy('m.created_at')
      .select('u.id as userId', 'u.first_name as firstName', 'u.last_name as lastName', 'u.email', 'm.role'),
    canManage
      ? db('organization_invitations')
          .where({ organization_id: id })
          .whereNull('accepted_at')
          .where('expires_at', '>', new Date())
          .select('id', 'email', 'role', 'expires_at as expiresAt')
      : [],
  ]);

  return { id: organization.id, name: organization.name, currency: organization.currency, role: membership.role, members, invitations };
}

export async function updateOrganization(user, id, { name, currency }) {
  await assertManager(id, user.id);
  await db('organizations').where({ id }).update({ name, currency });
}

export async function deleteOrganization(user, id) {
  const membership = await getMembership(id, user.id);
  if (membership.role !== 'owner') throw forbidden('Only the owner can delete an organization');
  await db('organizations').where({ id }).delete();
}

export async function inviteMember(user, id, { email, role }) {
  await assertManager(id, user.id);

  const existing = await db('organization_members as m')
    .join('users as u', 'u.id', 'm.user_id')
    .where({ 'm.organization_id': id, 'u.email': email })
    .first('u.id');
  if (existing) throw new AppError('That person is already a member', 409);

  const organization = await db('organizations').where({ id }).first('name');
  const { token, hash } = createOpaqueToken();

  // A fresh invitation replaces any earlier unused one for the same address.
  await db.transaction(async (trx) => {
    await trx('organization_invitations').where({ organization_id: id, email }).whereNull('accepted_at').delete();
    await trx('organization_invitations').insert({
      organization_id: id,
      email,
      role,
      token_hash: hash,
      invited_by: user.id,
      expires_at: new Date(Date.now() + INVITE_TTL_MS),
    });
  });

  const inviteUrl = `${env.APP_URL}/invite/${token}`;
  await sendMail({
    to: email,
    subject: `You're invited to ${organization.name} on Budget Book`,
    html: actionEmail({
      heading: `Join ${organization.name}`,
      text: `${user.first_name} ${user.last_name} invited you to share budgets on Budget Book. This invitation expires in 7 days.`,
      actionLabel: 'Accept invitation',
      actionUrl: inviteUrl,
    }),
  });

  // Without email configured, the only way to deliver the link is to give it to the inviter.
  return isMailConfigured ? {} : { inviteUrl };
}

export async function revokeInvitation(user, id, invitationId) {
  await assertManager(id, user.id);
  const removed = await db('organization_invitations').where({ id: invitationId, organization_id: id }).delete();
  if (!removed) throw notFound('Invitation');
}

export async function acceptInvitation(user, token) {
  return db.transaction(async (trx) => {
    const invitation = await trx('organization_invitations')
      .where({ token_hash: hashToken(token) })
      .whereNull('accepted_at')
      .where('expires_at', '>', new Date())
      .forUpdate()
      .first();
    if (!invitation) throw new AppError('This invitation is invalid or has expired');

    // A forwarded link must not let a different account join.
    if (invitation.email !== user.email.toLowerCase()) {
      throw forbidden('This invitation was sent to a different email address');
    }

    await trx('organization_members')
      .insert({ organization_id: invitation.organization_id, user_id: user.id, role: invitation.role })
      .onConflict(['organization_id', 'user_id'])
      .ignore();
    await trx('organization_invitations').where({ id: invitation.id }).update({ accepted_at: new Date() });

    return { organizationId: invitation.organization_id };
  });
}

export async function updateMemberRole(user, id, targetUserId, role) {
  await assertManager(id, user.id);
  const target = await getMembership(id, targetUserId);
  if (target.role === 'owner') throw forbidden("The owner's role can't be changed");
  await db('organization_members').where({ organization_id: id, user_id: targetUserId }).update({ role });
}

export async function removeMember(user, id, targetUserId) {
  await assertManager(id, user.id);
  const target = await getMembership(id, targetUserId);
  if (target.role === 'owner') throw forbidden("The owner can't be removed");
  await db('organization_members').where({ organization_id: id, user_id: targetUserId }).delete();
}
