import { migrate } from '../src/db/bootstrap.js';
import { db } from '../src/db/knex.js';
import { logger } from '../src/config/logger.js';

try {
  await migrate();
} catch (error) {
  logger.error({ err: error }, 'Migration failed');
  process.exitCode = 1;
} finally {
  await db.destroy();
}
