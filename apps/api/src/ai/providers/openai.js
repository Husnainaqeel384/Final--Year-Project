import { AiProviderError } from '../errors.js';
import { parseJsonText, requestJson } from './http.js';

// The Responses API is OpenAI's current interface; its newest models are documented there first.
const BASE = 'https://api.openai.com/v1';

// The models list also holds image, audio, embedding and moderation models, which can't answer here.
const TEXT_MODEL = /^(gpt-|o\d|chatgpt-)/;
const NOT_TEXT = /(audio|realtime|tts|transcribe|whisper|embedding|moderation|image|dall-e|search|computer|instruct)/;

export const openai = {
  id: 'openai',
  label: 'ChatGPT (OpenAI)',
  keysUrl: 'https://platform.openai.com/api-keys',
  // OpenAI renames models often: prefer the newest "sol" (near-flagship, lower cost), then the newest GPT.
  preferredPatterns: [/^gpt-[\d.]+-sol$/, /^gpt-[\d.]+/],

  async listModels(apiKey) {
    const { data = [] } = await requestJson(`${BASE}/models`, { headers: { Authorization: `Bearer ${apiKey}` } });
    return data
      .map((model) => model.id)
      .filter((id) => TEXT_MODEL.test(id) && !NOT_TEXT.test(id))
      .sort((a, b) => b.localeCompare(a, 'en', { numeric: true }))
      .map((id) => ({ id, label: id }));
  },

  async generateJson({ apiKey, model, system, prompt, image, schema }) {
    const content = [{ type: 'input_text', text: prompt }];
    if (image) content.push({ type: 'input_image', image_url: `data:${image.mediaType};base64,${image.base64}` });

    const result = await requestJson(`${BASE}/responses`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: {
        model,
        instructions: system,
        input: [{ role: 'user', content }],
        // Strict structured outputs make the reply match the schema exactly, as with Claude.
        text: { format: { type: 'json_schema', name: 'budget_book_reply', schema, strict: true } },
        max_output_tokens: 16000,
      },
    });

    if (result.status === 'incomplete') {
      throw new AiProviderError(result.incomplete_details?.reason === 'content_filter' ? 'refused' : 'output');
    }
    const parts = (result.output ?? []).filter((item) => item.type === 'message').flatMap((item) => item.content ?? []);
    if (parts.some((part) => part.type === 'refusal')) throw new AiProviderError('refused');
    return parseJsonText(parts.filter((part) => part.type === 'output_text').map((part) => part.text).join(''));
  },
};
