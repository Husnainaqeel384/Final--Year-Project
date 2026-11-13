import { createHash, randomBytes } from 'node:crypto';

/** Long random links are stored hashed; SHA-256 is enough because they cannot be guessed. */
export function createOpaqueToken() {
  const token = randomBytes(32).toString('hex');
  return { token, hash: hashToken(token) };
}

export const hashToken = (token) => createHash('sha256').update(token).digest('hex');
