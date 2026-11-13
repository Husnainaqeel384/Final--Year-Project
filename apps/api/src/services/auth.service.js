import { randomUUID } from 'node:crypto';
import { unlink, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { db } from '../db/knex.js';
import { AppError } from '../utils/errors.js';
import { createOpaqueToken, hashToken } from '../utils/tokens.js';
import { actionEmail, sendMail } from './mail.service.js';

const BCRYPT_COST = 12;
const RESET_TTL_MS = 30 * 60 * 1000;
export const UPLOADS_DIR = fileURLToPath(new URL('../../uploads/', import.meta.url));

// Compared against when an email is unknown, so failed logins take the same
// time either way and response timing can't reveal who has an account.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', BCRYPT_COST);

export function presentUser(user) {
  return {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    username: user.username,
    email: user.email,
    role: user.role,
    currency: user.currency,
    avatarUrl: user.avatar ? `/uploads/${user.avatar}` : null,
  };
}

export const signSession = (user) =>
  jwt.sign({ sub: user.id, tv: user.token_version }, env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: env.JWT_EXPIRES_IN,
  });

export function listOrganizationsFor(userId) {
  return db('organization_members as m')
    .join('organizations as o', 'o.id', 'm.organization_id')
    .where('m.user_id', userId)
    .orderBy('o.name')
    .select('o.id', 'o.name', 'o.currency', 'm.role');
}

async function assertAvailable({ email, username }, excludeUserId) {
  const clash = await db('users')
    .where((query) => query.where({ email }).orWhere({ username }))
    .modify((query) => {
      if (excludeUserId) query.whereNot({ id: excludeUserId });
    })
    .first('email');
  if (clash) {
    throw new AppError(clash.email === email ? 'That email is already registered' : 'That username is taken', 409);
  }
}

export async function registerUser({ firstName, lastName, username, email, password }) {
  await assertAvailable({ email, username });
  await db('users').insert({
    first_name: firstName,
    last_name: lastName,
    username,
    email,
    password_hash: await bcrypt.hash(password, BCRYPT_COST),
  });
}

export async function authenticate({ email, password }) {
  const user = await db('users').where({ email }).first();
  const matches = await bcrypt.compare(password, user?.password_hash ?? DUMMY_HASH);
  if (!user || !matches) throw new AppError('Incorrect email or password', 401);
  return user;
}

export async function updateProfile(user, changes) {
  await assertAvailable({ email: changes.email, username: changes.username }, user.id);
  await db('users').where({ id: user.id }).update({
    first_name: changes.firstName,
    last_name: changes.lastName,
    username: changes.username,
    email: changes.email,
    currency: changes.currency,
  });
  return db('users').where({ id: user.id }).first();
}

/** Changes only the currency label; stored amounts are not converted. */
export async function updatePreferences(user, { currency }) {
  await db('users').where({ id: user.id }).update({ currency });
  return db('users').where({ id: user.id }).first();
}

const IMAGE_SIGNATURES = [
  { extension: 'jpg', matches: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { extension: 'png', matches: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { extension: 'webp', matches: (b) => b.toString('latin1', 0, 4) === 'RIFF' && b.toString('latin1', 8, 12) === 'WEBP' },
];

export async function saveAvatar(user, file) {
  if (!file) throw new AppError('Choose an image to upload');

  // The bytes decide the type, not the filename or header, both of which the client controls.
  const type = IMAGE_SIGNATURES.find((signature) => signature.matches(file.buffer));
  if (!type) throw new AppError('Upload a JPG, PNG or WebP image');

  const name = `${randomUUID()}.${type.extension}`;
  await writeFile(`${UPLOADS_DIR}${name}`, file.buffer);
  await db('users').where({ id: user.id }).update({ avatar: name });

  if (user.avatar) {
    await unlink(`${UPLOADS_DIR}${user.avatar}`).catch((error) => {
      logger.warn({ err: error }, 'Could not remove the previous avatar');
    });
  }
  return db('users').where({ id: user.id }).first();
}

export async function changePassword(user, { currentPassword, newPassword }) {
  if (!(await bcrypt.compare(currentPassword, user.password_hash))) {
    throw new AppError('Your current password is incorrect', 400);
  }
  await db('users').where({ id: user.id }).update({
    password_hash: await bcrypt.hash(newPassword, BCRYPT_COST),
    token_version: user.token_version + 1,
  });
  return db('users').where({ id: user.id }).first();
}

export async function requestPasswordReset(email) {
  const user = await db('users').where({ email }).first();
  // The caller responds identically either way, so this can't be used to discover accounts.
  if (!user) return;

  const { token, hash } = createOpaqueToken();
  await db('password_reset_tokens').insert({
    user_id: user.id,
    token_hash: hash,
    expires_at: new Date(Date.now() + RESET_TTL_MS),
  });

  await sendMail({
    to: user.email,
    subject: 'Reset your Budget Book password',
    html: actionEmail({
      heading: 'Reset your password',
      text: 'Use the button below to choose a new password. This link expires in 30 minutes.',
      actionLabel: 'Reset password',
      actionUrl: `${env.APP_URL}/reset-password/${token}`,
    }),
  });
}

export async function resetPassword({ token, password }) {
  const hash = await bcrypt.hash(password, BCRYPT_COST);

  await db.transaction(async (trx) => {
    const record = await trx('password_reset_tokens')
      .where({ token_hash: hashToken(token) })
      .whereNull('used_at')
      .where('expires_at', '>', new Date())
      .forUpdate()
      .first();
    if (!record) throw new AppError('This reset link is invalid or has expired', 400);

    await trx('password_reset_tokens').where({ id: record.id }).update({ used_at: new Date() });
    await trx('users')
      .where({ id: record.user_id })
      .update({ password_hash: hash, token_version: trx.raw('token_version + 1') });
  });
}
