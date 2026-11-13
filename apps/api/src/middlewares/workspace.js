import { db } from '../db/knex.js';
import { AppError, forbidden } from '../utils/errors.js';

/** Works out whose data this request acts on, and confirms the user may access it. */
export async function resolveWorkspace(req, _res, next) {
  const header = req.get('X-Organization-Id');

  if (!header) {
    req.workspace = { userId: req.user.id, organizationId: null, role: 'owner', currency: req.user.currency };
    return next();
  }

  const organizationId = Number(header);
  if (!Number.isInteger(organizationId) || organizationId <= 0) {
    throw new AppError('Invalid organization', 400);
  }

  const membership = await db('organization_members as m')
    .join('organizations as o', 'o.id', 'm.organization_id')
    .where({ 'm.organization_id': organizationId, 'm.user_id': req.user.id })
    .first('m.role', 'o.currency');
  if (!membership) throw forbidden('You are not a member of this organization');

  req.workspace = {
    userId: req.user.id,
    organizationId,
    role: membership.role,
    currency: membership.currency,
  };
  return next();
}

/** Structural changes such as budgets and webhooks are limited to owners and admins. */
export function requireWorkspaceManager(req, _res, next) {
  if (!['owner', 'admin'].includes(req.workspace.role)) {
    throw forbidden('Only organization owners and admins can do that');
  }
  next();
}
