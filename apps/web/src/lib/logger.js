import log from 'loglevel';

// Application code logs through this module only: the level is set in one place,
// and production browsers stay quiet apart from real problems.
log.setLevel(import.meta.env.PROD ? 'warn' : 'debug');

export const logger = log;
