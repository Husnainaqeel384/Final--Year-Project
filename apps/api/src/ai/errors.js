import { AppError } from '../utils/errors.js';

/**
 * Every provider reports failures in its own way. Each adapter turns them into
 * one of these kinds, so the rest of the app has one set of messages.
 */
export class AiProviderError extends Error {
  constructor(kind, detail = '') {
    super(detail || kind);
    this.kind = kind;
  }
}

const MESSAGES = {
  auth: (name) => `${name} rejected the API key. Check it in Settings.`,
  quota: (name) => `${name} says the key has reached its usage limit or has no credit left.`,
  model: (name) => `${name} doesn't offer the chosen model to this key. Pick another model in Settings.`,
  image: () => "This model can't read images. Choose a model that supports images in Settings.",
  unsupported: () => "The chosen model can't do this. Choose a newer model in Settings.",
  refused: () => 'The AI declined this request.',
  output: () => "The AI's answer couldn't be read. Please try again.",
  unavailable: (name) => `${name} couldn't be reached. Please try again in a moment.`,
  timeout: (name) => `${name} took too long to answer. Try again, or pick a faster model (for example a "flash" or "lite" one) in Settings.`,
};

// Never 401: the web app treats 401 as "your session ended" and signs the person out.
const STATUS = { auth: 400, quota: 429, model: 400, image: 400, unsupported: 400, refused: 422, output: 502, unavailable: 503, timeout: 504 };

export function toAppError(error, providerLabel) {
  if (error instanceof AppError) return error;
  const kind = error instanceof AiProviderError && MESSAGES[error.kind] ? error.kind : 'unavailable';
  return new AppError(MESSAGES[kind](providerLabel), STATUS[kind]);
}
