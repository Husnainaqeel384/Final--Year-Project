import { AiProviderError } from '../errors.js';
import { parseJsonText, requestJson } from './http.js';

// The long-standing generateContent API: stable across model generations.
const BASE = 'https://generativelanguage.googleapis.com/v1beta';
const BLOCKED = new Set(['SAFETY', 'PROHIBITED_CONTENT', 'BLOCKLIST', 'SPII', 'RECITATION']);
// Gemini 3 and later think at 'medium' or higher by default, which can take over a minute.
// Reading a receipt or explaining totals needs little reasoning, and 'low' is accepted by
// every general Gemini 3 model. Older models don't know the setting, so it isn't sent to them.
const THINKS_BY_LEVEL = /^gemini-([3-9]|\d{2,})/;

export const gemini = {
  id: 'gemini',
  label: 'Gemini (Google)',
  keysUrl: 'https://aistudio.google.com/apikey',
  // Google renames models often, so the newest general "flash" model is chosen from the live list.
  preferredPatterns: [/^gemini-[\d.]+-flash$/, /^gemini-[\d.]+/],

  async listModels(apiKey) {
    const { models = [] } = await requestJson(`${BASE}/models?pageSize=200`, { headers: { 'x-goog-api-key': apiKey } });
    return models
      .filter((model) => model.name?.startsWith('models/gemini') && model.supportedGenerationMethods?.includes('generateContent'))
      .map((model) => ({ id: model.name.replace('models/', ''), label: model.displayName || model.name }));
  },

  async generateJson({ apiKey, model, system, prompt, image }) {
    const parts = [];
    if (image) parts.push({ inline_data: { mime_type: image.mediaType, data: image.base64 } });
    parts.push({ text: prompt });

    const result = await requestJson(`${BASE}/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'x-goog-api-key': apiKey },
      body: {
        system_instruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts }],
        // JSON mode; the reply is checked against the schema in our own code. Thinking models
        // spend part of this allowance on reasoning, so it leaves room beyond the short answer.
        generationConfig: {
          responseMimeType: 'application/json',
          maxOutputTokens: 16384,
          ...(THINKS_BY_LEVEL.test(model) ? { thinkingConfig: { thinkingLevel: 'low' } } : {}),
        },
      },
    });

    if (result.promptFeedback?.blockReason) throw new AiProviderError('refused', `blocked: ${result.promptFeedback.blockReason}`);
    const candidate = result.candidates?.[0];
    if (BLOCKED.has(candidate?.finishReason)) throw new AiProviderError('refused', `finishReason ${candidate.finishReason}`);
    if (candidate?.finishReason === 'MAX_TOKENS') throw new AiProviderError('output', 'finishReason MAX_TOKENS');
    // Thinking models can return their reasoning as separate parts; only the answer is parsed.
    const text = (candidate?.content?.parts ?? []).filter((part) => !part.thought).map((part) => part.text ?? '').join('');
    return parseJsonText(text);
  },
};
