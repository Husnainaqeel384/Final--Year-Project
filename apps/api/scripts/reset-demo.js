import { env } from '../src/config/env.js';
import { migrate } from '../src/db/bootstrap.js';
import { db } from '../src/db/knex.js';
import { logger } from '../src/config/logger.js';
import { resetDemoData } from '../seeds/demo.js';

// The reset deletes the demo accounts' rows, so it only runs where demo mode was chosen on purpose.
if (!env.DEMO_MODE) {
  logger.error('DEMO_MODE is not true in this environment, so the demo was not reset');
  process.exitCode = 1;
} else {
  try {
    await migrate();
    await resetDemoData();
  } catch (error) {
    logger.error({ err: error }, 'The demo reset failed');
    process.exitCode = 1;
  }
}
await db.destroy();
