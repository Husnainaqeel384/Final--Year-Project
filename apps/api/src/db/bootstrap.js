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
  const [, applied] = await db.migrate.latest();
  logger.info({ applied }, 'Database schema is up to date');
}

export async function bootstrapDatabase() {
  if (env.RUN_MIGRATIONS_ON_START) await migrate();
  // A demo site is useless without its demo accounts.
  if (env.SEED_DEMO_DATA || env.DEMO_MODE) await seedDemoData();
}
