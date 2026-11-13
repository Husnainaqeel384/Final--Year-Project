import { fileURLToPath } from 'node:url';
import { env } from './src/config/env.js';

export default {
  client: 'mysql2',
  connection: {
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    charset: 'utf8mb4',
    // Keeps DATE columns as plain strings; converting to Date shifts them across timezones.
    dateStrings: true,
    // Returns DECIMAL columns as numbers. Amounts fit in DECIMAL(14,2), well inside double precision.
    decimalNumbers: true,
  },
  pool: { min: 0, max: 10 },
  migrations: {
    directory: fileURLToPath(new URL('./migrations', import.meta.url)),
    tableName: 'knex_migrations',
  },
};
