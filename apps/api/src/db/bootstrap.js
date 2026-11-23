import knex from 'knex';
import config from '../../knexfile.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { db } from './knex.js';
import { seedDemoData } from '../../seeds/demo.js';

/** The application pool needs an existing database, so this step uses a short-lived connection. */
async function createDatabaseIfMissing() {
  const { database: _database, ...server } = config.connection;
  const admin = knex({ ...config, connection: server, pool: { min: 0, max: 1 } });
  try {
    await admin.raw(
      `CREATE DATABASE IF NOT EXISTS \`${env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
  } finally {
    await admin.destroy();
  }
}

export async function migrate() {
  await createDatabaseIfMissing();
  let applied;
  try {
    [, applied] = await db.migrate.latest();
  } catch (error) {
    // `node --watch` restarts the API whenever a file changes, which can stop it in the middle
    // of a migration and leave the lock set. Only one API runs in development, so a lock found
    // at startup there is stale. Elsewhere it may be another instance, so it is never touched.
    if (env.NODE_ENV !== 'development' || error.name !== 'MigrationLocked') throw error;
    logger.warn('Released a migration lock left by an interrupted start');
    await db.migrate.forceFreeMigrationsLock();
    [, applied] = await db.migrate.latest();
  }
  logger.info({ applied }, 'Database schema is up to date');
}

export async function bootstrapDatabase() {
  if (env.RUN_MIGRATIONS_ON_START) await migrate();
  // A demo site is useless without its demo accounts.
  if (env.SEED_DEMO_DATA || env.DEMO_MODE) await seedDemoData();
}
