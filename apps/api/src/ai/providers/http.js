import { AiProviderError } from '../errors.js';

// A receipt or a summary normally comes back in seconds. Waiting longer than this only
// keeps the person staring at a spinner; a faster model is the better fix.
export const PROVIDER_TIMEOUT_MS = 45_000;

/**
 * JSON request for the providers that are called over plain HTTP. Status codes
 * become AiProviderError kinds. Only the provider's own short error message is
 * kept for the server log, never the whole body, which can echo the request.
 */
function errorDetail(status, text) {
  let message = '';
  try {
    const parsed = JSON.parse(text);
    message = parsed?.error?.message ?? parsed?.message ?? '';
  } catch {
    // Not JSON; the status alone has to do.
  }
  return `HTTP ${status}${message ? `: ${String(message).slice(0, 300)}` : ''}`;
}

export async function requestJson(url, { method = 'GET', headers = {}, body } = {}) {
  let response;
  try {
    response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
    });
  } catch (error) {
    if (error.name === 'TimeoutError') throw new AiProviderError('timeout', `no answer within ${PROVIDER_TIMEOUT_MS / 1000}s`);
    throw new AiProviderError('unavailable', String(error.cause?.code ?? error.message));
  }

  const text = await response.text();
  if (response.ok) {
    try {
      return JSON.parse(text);
    } catch {
      throw new AiProviderError('output', 'response was not JSON');
    }
  }

  const hint = text.toLowerCase();
  const detail = errorDetail(response.status, text);
  if (response.status === 401 || response.status === 403 || hint.includes('api_key_invalid') || hint.includes('api key not valid')) {
    throw new AiProviderError('auth', detail);
  }
  if (response.status === 402 || response.status === 429) throw new AiProviderError('quota', detail);
  if (response.status === 404) throw new AiProviderError('model', detail);
  if (response.status === 400 && hint.includes('image')) throw new AiProviderError('image', detail);
  if (response.status === 400 && hint.includes('model')) throw new AiProviderError('model', detail);
  // Any other rejected request, such as a schema the chosen model can't follow.
  if (response.status === 400) throw new AiProviderError('unsupported', detail);
  throw new AiProviderError('unavailable', detail);
}

/** Models sometimes wrap JSON in a Markdown code fence even when asked not to. */
export function parseJsonText(text) {
  const trimmed = (text ?? '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  if (!trimmed) throw new AiProviderError('output', 'empty reply');
  try {
    return JSON.parse(trimmed);
  } catch {
    throw new AiProviderError('output', 'reply was not valid JSON');
  }
}
