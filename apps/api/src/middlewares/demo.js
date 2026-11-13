import { isDemoAccount } from '../services/demo.service.js';
import { forbidden } from '../utils/errors.js';

const BLOCKED = 'This is turned off in the demo. Create a free account to try it.';

/**
 * On the public demo every visitor shares these accounts and their password is
 * in the repository, so anything that could lock others out, email strangers or
 * change what other accounts see has to be refused.
 */
export function blockDemoAccount(req, _res, next) {
  if (isDemoAccount(req.user)) throw forbidden(BLOCKED);
  next();
}

/** Lets a demo visitor look around an admin screen without changing anything. */
export function blockDemoWrites(req, _res, next) {
  if (req.method !== 'GET' && req.method !== 'HEAD' && isDemoAccount(req.user)) throw forbidden(BLOCKED);
  next();
}
