import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from 'node:crypto';
import { env } from '../config/env.js';

/**
 * Provider keys are encrypted with AES-256-GCM before they reach the database,
 * so a leaked dump or backup doesn't hand out people's API keys.
 *
 * The encryption key is derived from JWT_SECRET instead of a new setting, so
 * existing installs need no change. The separate HKDF label keeps it unrelated
 * to the session signing key. Changing JWT_SECRET makes saved keys unreadable;
 * people then add them again, which the settings page explains.
 */
const VERSION = 'v1';
const encryptionKey = Buffer.from(hkdfSync('sha256', env.JWT_SECRET, 'budget-book', 'ai-provider-keys', 32));

export function encryptKey(plain) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey, iv);
  const data = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  return [VERSION, iv.toString('base64'), cipher.getAuthTag().toString('base64'), data.toString('base64')].join(':');
}

/** Returns null when the value can't be read, for example after JWT_SECRET changed. */
export function decryptKey(stored) {
  try {
    const [version, iv, tag, data] = stored.split(':');
    if (version !== VERSION) return null;
    const decipher = createDecipheriv('aes-256-gcm', encryptionKey, Buffer.from(iv, 'base64'));
    decipher.setAuthTag(Buffer.from(tag, 'base64'));
    return Buffer.concat([decipher.update(Buffer.from(data, 'base64')), decipher.final()]).toString('utf8');
  } catch {
    return null;
  }
}

/** Enough to recognise a key without revealing it. */
export const keyHint = (plain) => plain.slice(-4);
