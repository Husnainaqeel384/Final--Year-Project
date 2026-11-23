/**
 * On the public demo a visitor's own AI key lives only in this browser tab
 * (sessionStorage), is sent with each AI request, and is gone when the tab
 * closes. It is never saved on the server, because the demo account is shared.
 */
const STORAGE_KEY = 'aiSessionKey';
// Also kept in memory, for browsers that block sessionStorage.
let memory = null;

export function readAiSession() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

export function saveAiSession({ provider, model, apiKey }) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ provider, model, apiKey }));
  } catch {
    // Storage can be blocked (private windows); the key then lasts until the page reloads.
  }
  memory = { provider, model, apiKey };
}

export function clearAiSession() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing stored, so nothing to clear.
  }
  memory = null;
}

/** What the settings screen may show: never the key itself. */
export function aiSessionSummary() {
  const session = memory ?? readAiSession();
  return session ? { provider: session.provider, model: session.model, keyHint: session.apiKey.slice(-4) } : null;
}

export function aiSessionHeaders() {
  const session = memory ?? readAiSession();
  return session ? { 'X-AI-Provider': session.provider, 'X-AI-Model': session.model, 'X-AI-Key': session.apiKey } : {};
}
