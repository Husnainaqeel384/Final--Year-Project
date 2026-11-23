import { afterEach, describe, expect, it, vi } from 'vitest';
import { AiProviderError } from '../src/ai/errors.js';
import { providers, suggestedModel } from '../src/ai/providers/index.js';

// fetch is replaced in every test: these check what is sent and how replies are read, offline.
const reply = (body, status = 200) => vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(body), { status }));
const sentBody = (spy) => JSON.parse(spy.mock.calls[0][1].body);
const kindOf = async (promise) => {
  try {
    await promise;
    return null;
  } catch (error) {
    return error instanceof AiProviderError ? error.kind : error.message;
  }
};

const { openai, gemini } = providers;
const SCHEMA = { type: 'object', properties: { a: { type: 'number' } }, required: ['a'], additionalProperties: false };
const ask = (extra = {}) => openai.generateJson({ apiKey: 'sk-test', model: 'gpt-6.1-sol', system: 'Be brief.', prompt: 'Reply with json', schema: SCHEMA, ...extra });

afterEach(() => {
  vi.restoreAllMocks();
});

describe('OpenAI provider', () => {
  it('lists only models that can answer in text, and suggests the newest "sol" model', async () => {
    reply({ data: ['gpt-6-astra', 'gpt-6.1-sol', 'gpt-5.6-sol', 'text-embedding-3-large', 'gpt-image-2', 'whisper-1', 'gpt-realtime', 'o4-mini'].map((id) => ({ id })) });
    const models = await openai.listModels('sk-test');
    const ids = models.map((model) => model.id);
    expect(ids).toEqual(expect.arrayContaining(['gpt-6-astra', 'gpt-6.1-sol', 'gpt-5.6-sol', 'o4-mini']));
    expect(ids).not.toEqual(expect.arrayContaining(['gpt-image-2']));
    expect(ids.some((id) => /embedding|whisper|realtime|image/.test(id))).toBe(false);
    expect(suggestedModel(openai, models)).toBe('gpt-6.1-sol');
  });

  it('sends a strict JSON schema and the image, and reads the answer text', async () => {
    const spy = reply({
      status: 'completed',
      output: [
        { type: 'reasoning', summary: [] },
        { type: 'message', role: 'assistant', content: [{ type: 'output_text', text: '{"a": 1}' }] },
      ],
    });
    expect(await ask({ image: { mediaType: 'image/png', base64: 'AAAA' } })).toEqual({ a: 1 });

    const [url, init] = spy.mock.calls[0];
    expect(url).toBe('https://api.openai.com/v1/responses');
    expect(init.headers.Authorization).toBe('Bearer sk-test');
    const body = sentBody(spy);
    expect(body).toMatchObject({ model: 'gpt-6.1-sol', instructions: 'Be brief.' });
    expect(body.text.format).toMatchObject({ type: 'json_schema', strict: true, schema: SCHEMA });
    expect(body.input[0].content).toContainEqual({ type: 'input_image', image_url: 'data:image/png;base64,AAAA' });
  });

  it('turns refusals, cut-off answers and HTTP errors into clear kinds', async () => {
    reply({ status: 'completed', output: [{ type: 'message', content: [{ type: 'refusal', refusal: 'No.' }] }] });
    expect(await kindOf(ask())).toBe('refused');
    vi.restoreAllMocks();

    reply({ status: 'incomplete', incomplete_details: { reason: 'max_output_tokens' }, output: [] });
    expect(await kindOf(ask())).toBe('output');
    vi.restoreAllMocks();

    reply({ error: { message: 'Incorrect API key provided' } }, 401);
    expect(await kindOf(ask())).toBe('auth');
    vi.restoreAllMocks();

    reply({ error: { code: 'insufficient_quota' } }, 429);
    expect(await kindOf(ask())).toBe('quota');
    vi.restoreAllMocks();

    reply({ error: { message: 'Invalid schema for response_format' } }, 400);
    expect(await kindOf(ask())).toBe('unsupported');
  });

  it('reports a network failure as unavailable', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('fetch failed'));
    expect(await kindOf(ask())).toBe('unavailable');
  });
});

describe('suggestedModel', () => {
  it('prefers the newest general Gemini flash model, then any Gemini model', () => {
    const list = (ids) => ids.map((id) => ({ id }));
    expect(suggestedModel(gemini, list(['gemini-3.5-pro', 'gemini-3.8-flash', 'gemini-3.10-flash', 'gemini-3.8-flash-lite']))).toBe('gemini-3.10-flash');
    expect(suggestedModel(gemini, list(['gemini-3.5-pro', 'gemini-3.6-pro']))).toBe('gemini-3.6-pro');
  });
});

describe('Gemini provider', () => {
  const askGemini = (model) =>
    providers.gemini.generateJson({ apiKey: 'g-test', model, system: 'Be brief.', prompt: 'Reply with json', schema: SCHEMA });
  const answer = { candidates: [{ finishReason: 'STOP', content: { parts: [{ text: 'thinking…', thought: true }, { text: '{"a": 2}' }] } }] };

  it('asks Gemini 3 and later to think at a low level, so answers come back quickly', async () => {
    const spy = reply(answer);
    expect(await askGemini('gemini-3.8-flash')).toEqual({ a: 2 });
    expect(sentBody(spy).generationConfig.thinkingConfig).toEqual({ thinkingLevel: 'low' });
  });

  it("doesn't send the setting to older models that don't know it", async () => {
    const spy = reply(answer);
    await askGemini('gemini-2.5-flash');
    expect(sentBody(spy).generationConfig.thinkingConfig).toBeUndefined();
  });

  it("keeps Gemini's own error message for the server log", async () => {
    reply({ error: { code: 400, message: 'Unable to process input image.' } }, 400);
    try {
      await askGemini('gemini-3.8-flash');
    } catch (error) {
      expect(error).toMatchObject({ kind: 'image', message: 'HTTP 400: Unable to process input image.' });
    }
  });
});

describe('slow providers', () => {
  it('reports a provider that takes too long as a timeout, with a clear message', async () => {
    const timeout = Object.assign(new Error('The operation was aborted due to timeout'), { name: 'TimeoutError' });
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(timeout);
    const error = await providers.gemini
      .generateJson({ apiKey: 'g-test', model: 'gemini-3.8-flash', system: 's', prompt: 'p', schema: SCHEMA })
      .catch((caught) => caught);
    expect(error).toMatchObject({ kind: 'timeout', message: 'no answer within 45s' });
    const { toAppError } = await import('../src/ai/errors.js');
    expect(toAppError(error, 'Gemini (Google)')).toMatchObject({ statusCode: 504, message: expect.stringMatching(/took too long to answer/) });
  });
});
