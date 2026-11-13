import app from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { bootstrapDatabase } from './db/bootstrap.js';
import { db } from './db/knex.js';
import { scheduleDemoReset } from './services/demo.service.js';

async function start() {
  await bootstrapDatabase();

  const stopDemoReset = env.DEMO_MODE ? scheduleDemoReset() : () => {};

  const server = app.listen(env.PORT, () => {
    logger.info(`API listening on port ${env.PORT}`);
  });

  /** Lets requests in progress finish so a restart doesn't cut anyone off. */
  const shutdown = (signal) => {
    logger.info(`${signal} received, shutting down`);
    stopDemoReset();
    server.close(async () => {
      await db.destroy();
      process.exit(0);
    });
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((error) => {
  logger.fatal({ err: error }, 'The API could not start');
  process.exit(1);
});
