import { AiProviderError } from '../errors.js';
import { parseJsonText, requestJson } from './http.js';

const BASE = 'https://api.deepseek.com';

export const deepseek = {
  id: 'deepseek',
  label: 'DeepSeek',
  keysUrl: 'https://platform.deepseek.com/api_keys',
  // The flash model is the one that reads images.
  preferredModels: ['deepseek-flash'],

  async listModels(apiKey) {
    const { data = [] } = await requestJson(`${BASE}/models`, { headers: { Authorization: `Bearer ${apiKey}` } });
    return data.map((model) => ({ id: model.id, label: model.id }));
  },

  async generateJson({ apiKey, model, system, prompt, image }) {
    const content = image
      ? [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: `data:${image.mediaType};base64,${image.base64}` } },
        ]
      : prompt;

    const result = await requestJson(`${BASE}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: {
        model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content },
        ],
        // JSON mode needs the word "json" and an example in the prompt; the task prompts include both.
        response_format: { type: 'json_object' },
        max_tokens: 8192,
      },
    });

    const choice = result.choices?.[0];
    if (choice?.finish_reason === 'content_filter') throw new AiProviderError('refused');
    if (choice?.finish_reason === 'length') throw new AiProviderError('output');
    // DeepSeek returns blank content when the model's output wasn't valid JSON.
    return parseJsonText(choice?.message?.content);
  },
};
