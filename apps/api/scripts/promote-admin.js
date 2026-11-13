// Run from a trusted shell: npm run admin:promote -- you@example.com
// Admin rights are granted here because no web request should be able to create the first admin.
import { db } from '../src/db/knex.js';
import { logger } from '../src/config/logger.js';

const email = process.argv[2];

try {
  if (!email) throw new Error('Usage: npm run admin:promote -- you@example.com');
  const updated = await db('users').where({ email }).update({ role: 'admin' });
  if (!updated) throw new Error(`No account found for ${email}`);
  logger.info({ email }, 'Account promoted to admin');
} catch (error) {
  logger.error(error.message);
  process.exitCode = 1;
} finally {
  await db.destroy();
}
