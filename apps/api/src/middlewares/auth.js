import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { db } from '../db/knex.js';
import { AppError, forbidden } from '../utils/errors.js';

export const SESSION_COOKIE = 'bb_session';

export async function requireAuth(req, _res, next) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) throw new AppError('Please sign in', 401);

  let payload;
  try {
    // Pinning the algorithm blocks tokens forged with a different signing method.
    payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch {
    throw new AppError('Your session has expired. Please sign in again', 401);
  }

  // Checked per request so a role change, password change or deletion takes effect at once.
  const user = await db('users').where({ id: payload.sub }).first();
  if (!user || user.token_version !== payload.tv) {
    throw new AppError('Your session has expired. Please sign in again', 401);
  }

  req.user = user;
  next();
}

export function requireAdmin(req, _res, next) {
  if (req.user.role !== 'admin') throw forbidden();
  next();
}
