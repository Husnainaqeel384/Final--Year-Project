import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.js'],
    // Integration suites share one database, so files run one at a time.
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 60000,
    env: {
      NODE_ENV: 'test',
      LOG_LEVEL: 'silent',
      // A dedicated database: tests must never touch development data.
      DB_NAME: 'budget_book_test',
      JWT_SECRET: 'test-secret-that-is-long-enough-for-validation',
      RUN_MIGRATIONS_ON_START: 'false',
      SEED_DEMO_DATA: 'false',
      SMTP_HOST: '',
    },
  },
});
