import { migrate } from '../src/db/bootstrap.js';
import { db } from '../src/db/knex.js';
import { logger } from '../src/config/logger.js';
import { seedDemoData } from '../seeds/demo.js';

try {
  await migrate();
  await seedDemoData();
} catch (error) {
  logger.error({ err: error }, 'Seeding failed');
  process.exitCode = 1;
} finally {
  await db.destroy();
}
