import { claude } from './claude.js';
import { deepseek } from './deepseek.js';
import { gemini } from './gemini.js';
import { openai } from './openai.js';

/**
 * Every provider has the same shape:
 *   listModels(apiKey)        -> [{ id, label }]   free; also proves the key works
 *   generateJson({ apiKey, model, system, prompt, image?, schema }) -> object
 * Adding a provider means one new file here and a migration adding its id to the provider columns.
 * Tests replace these methods, so the suite never calls a real AI.
 */
export const providers = { claude, openai, gemini, deepseek };

export const PROVIDER_IDS = Object.keys(providers);

export function getProvider(id) {
  return providers[id];
}

/** The model to preselect after a key is checked. */
export function suggestedModel(provider, models) {
  const ids = models.map((model) => model.id);
  const preferred = provider.preferredModels?.find((id) => ids.includes(id));
  if (preferred) return preferred;
  // Patterns in order of preference; within one, the highest version number wins.
  for (const pattern of provider.preferredPatterns ?? []) {
    const matching = ids.filter((id) => pattern.test(id)).sort((x, y) => y.localeCompare(x, 'en', { numeric: true }));
    if (matching.length > 0) return matching[0];
  }
  return ids[0] ?? null;
}
