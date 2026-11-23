import Anthropic from '@anthropic-ai/sdk';
import { AiProviderError } from '../errors.js';
import { parseJsonText, PROVIDER_TIMEOUT_MS } from './http.js';

// These models accept server-side fallback: if a safety check declines a request,
// Anthropic retries it on a suitable model instead of returning a refusal.
const FALLBACK_MODELS = new Set(['claude-fable-5-2', 'claude-fable-5-1', 'claude-opus-5-5', 'claude-opus-5', 'claude-sonnet-5-5']);

const client = (apiKey) => new Anthropic({ apiKey, maxRetries: 1, timeout: PROVIDER_TIMEOUT_MS });

/** Most specific first, so a rate limit isn't reported as a generic failure. */
function translate(error) {
  if (error instanceof AiProviderError) return error;
  const detail = `${error.status ?? 'network'}: ${String(error.message).slice(0, 300)}`;
  if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) return new AiProviderError('auth', detail);
  if (error instanceof Anthropic.APIConnectionTimeoutError) return new AiProviderError('timeout', detail);
  if (error instanceof Anthropic.RateLimitError) return new AiProviderError('quota', detail);
  if (error instanceof Anthropic.NotFoundError) return new AiProviderError('model', detail);
  if (error instanceof Anthropic.BadRequestError) {
    const message = String(error.message).toLowerCase();
    if (message.includes('credit') || message.includes('billing')) return new AiProviderError('quota', detail);
    if (message.includes('image')) return new AiProviderError('image', detail);
    return new AiProviderError('unsupported', detail);
  }
  return new AiProviderError('unavailable', detail);
}

export const claude = {
  id: 'claude',
  label: 'Claude (Anthropic)',
  keysUrl: 'https://platform.claude.com/settings/keys',
  preferredModels: ['claude-opus-5-5'],

  /** Listing models is free, so it doubles as the check that a key works. */
  async listModels(apiKey) {
    try {
      const models = [];
      for await (const model of client(apiKey).models.list()) {
        models.push({ id: model.id, label: model.display_name || model.id });
      }
      return models;
    } catch (error) {
      throw translate(error);
    }
  },

  async generateJson({ apiKey, model, system, prompt, image, schema }) {
    const content = [];
    if (image) content.push({ type: 'image', source: { type: 'base64', media_type: image.mediaType, data: image.base64 } });
    content.push({ type: 'text', text: prompt });

    const params = {
      model,
      max_tokens: 16000,
      system,
      messages: [{ role: 'user', content }],
      // Structured outputs make the reply match the schema exactly.
      output_config: { format: { type: 'json_schema', schema } },
    };

    let response;
    try {
      response = FALLBACK_MODELS.has(model)
        ? await client(apiKey).beta.messages.create({ ...params, betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' })
        : await client(apiKey).messages.create(params);
    } catch (error) {
      throw translate(error);
    }

    if (response.stop_reason === 'refusal') throw new AiProviderError('refused');
    if (response.stop_reason === 'max_tokens') throw new AiProviderError('output');
    return parseJsonText(response.content.filter((block) => block.type === 'text').map((block) => block.text).join(''));
  },
};
