import { randomBytes } from 'node:crypto';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import app from '../src/app.js';
import { AiProviderError } from '../src/ai/errors.js';
import { decryptKey, encryptKey, keyHint } from '../src/ai/keys.js';
import { providers } from '../src/ai/providers/index.js';
import { cleanReceipt } from '../src/ai/receipt.js';
import { env } from '../src/config/env.js';
import { migrate } from '../src/db/bootstrap.js';
import { db } from '../src/db/knex.js';
import { resetDemoData } from '../seeds/demo.js';

// Every provider call is replaced, so these tests never reach a real AI or spend money.
const API = '/api/v1';
const PASSWORD = 'Correct-horse-1';
const KEY = 'sk-test-0123456789abcdef-SECRET-9f3a';
const MODELS = [{ id: 'claude-opus-5-5', label: 'Claude Opus 5.5' }, { id: 'claude-haiku-5-5', label: 'Claude Haiku 5.5' }];
// The smallest valid PNG header, enough for the type check.
const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(32)]);

async function createAccount() {
  const suffix = randomBytes(5).toString('hex');
  const email = `ai_${suffix}@example.com`;
  const agent = request.agent(app);
  await agent.post(`${API}/auth/register`).send({ firstName: 'Ai', lastName: 'User', username: `ai_${suffix}`, email, password: PASSWORD }).expect(201);
  const { body } = await agent.post(`${API}/auth/login`).send({ email, password: PASSWORD }).expect(200);
  return { agent, id: body.data.user.id };
}

const fakeModels = () => vi.spyOn(providers.claude, 'listModels').mockResolvedValue(MODELS);
const connect = (account, extra = {}) =>
  account.agent.put(`${API}/ai/settings`).send({ provider: 'claude', model: 'claude-opus-5-5', apiKey: KEY, ...extra });

beforeAll(async () => {
  await migrate();
});

afterEach(() => {
  vi.restoreAllMocks();
});

afterAll(async () => {
  env.DEMO_MODE = false;
  await db.destroy();
});

describe('key encryption', () => {
  it('reads back what it stored, without the key being visible', () => {
    const stored = encryptKey(KEY);
    expect(stored).not.toContain(KEY);
    expect(stored).not.toBe(encryptKey(KEY));
    expect(decryptKey(stored)).toBe(KEY);
    expect(keyHint(KEY)).toBe('9f3a');
  });

  it('refuses a stored value that was tampered with', () => {
    const [version, iv, tag, data] = encryptKey(KEY).split(':');
    const flipped = Buffer.from(data, 'base64');
    flipped[0] ^= 1;
    expect(decryptKey([version, iv, tag, flipped.toString('base64')].join(':'))).toBeNull();
    expect(decryptKey('not-a-key')).toBeNull();
  });
});

describe('cleanReceipt', () => {
  const categories = ['Groceries', 'Dining Out'];

  it('keeps only values the expense form can use', () => {
    expect(cleanReceipt({ readable: true, merchant: '  Maple Grocers ', date: '2026-03-14', total: 42.5, currency: 'usd', category: 'groceries' }, categories)).toEqual({
      readable: true,
      merchant: 'Maple Grocers',
      date: '2026-03-14',
      amount: 42.5,
      currency: 'USD',
      categoryName: 'Groceries',
      // A reply without line items still works, as one expense.
      items: [],
    });
  });

  it('cleans line items for splitting', () => {
    const { items } = cleanReceipt(
      {
        readable: true, merchant: 'Shop', date: '2026-03-14', total: 20, currency: 'USD', category: 'Groceries',
        items: [
          { description: ' Apples ', amount: 4.555, category: 'groceries' },
          { description: 'Coupon', amount: -1, category: null },
          { description: 'Free bag', amount: 0, category: null },
          { description: '', amount: 9, category: 'Spaceships' },
        ],
      },
      categories,
    );
    expect(items).toEqual([
      { description: 'Apples', amount: 4.56, categoryName: 'Groceries' },
      { description: 'Coupon', amount: -1, categoryName: null },
      { description: 'Item', amount: 9, categoryName: null },
    ]);
  });

  it('ignores line items in the wrong shape and keeps the rest', () => {
    const result = cleanReceipt({ readable: true, merchant: 'Shop', date: null, total: 5, currency: null, category: null, items: 'many' }, categories);
    expect(result).toMatchObject({ amount: 5, items: [] });
  });

  it('drops impossible dates, amounts and categories instead of failing', () => {
    const result = cleanReceipt({ readable: true, merchant: 'Shop', date: '2026-02-30', total: -3, currency: 'dollars', category: 'Spaceships' }, categories);
    expect(result).toMatchObject({ date: null, amount: null, currency: null, categoryName: null });
  });

  it('reports an answer in the wrong shape as unreadable', () => {
    expect(() => cleanReceipt({ total: 'twelve' }, categories)).toThrow(/couldn't be read/);
  });
});

describe('AI settings', () => {
  let owner;
  let stranger;

  beforeAll(async () => {
    owner = await createAccount();
    stranger = await createAccount();
  });

  it('lists the three providers and nothing saved yet', async () => {
    const { body } = await owner.agent.get(`${API}/ai/settings`).expect(200);
    expect(body.data.providers.map((p) => p.id)).toEqual(['claude', 'openai', 'gemini', 'deepseek']);
    expect(body.data.saved).toBeNull();
  });

  it('checks a key by listing its models and suggests one', async () => {
    const spy = fakeModels();
    const { body } = await owner.agent.post(`${API}/ai/models`).send({ provider: 'claude', apiKey: KEY }).expect(200);
    expect(spy).toHaveBeenCalledWith(KEY);
    expect(body.data.suggested).toBe('claude-opus-5-5');
  });

  it('saves the key encrypted and never sends it back', async () => {
    fakeModels();
    const { body, text } = await connect(owner).expect(200);
    expect(body.data).toMatchObject({ provider: 'claude', model: 'claude-opus-5-5', keyHint: '9f3a' });
    expect(text).not.toContain(KEY);

    const row = await db('ai_settings').where({ user_id: owner.id }).first();
    expect(row.api_key_encrypted).not.toContain(KEY);
    expect(decryptKey(row.api_key_encrypted)).toBe(KEY);
    expect(JSON.stringify((await owner.agent.get(`${API}/ai/settings`)).body)).not.toContain(KEY);
  });

  it('changes the model without asking for the key again', async () => {
    const spy = fakeModels();
    await owner.agent.put(`${API}/ai/settings`).send({ provider: 'claude', model: 'claude-haiku-5-5' }).expect(200);
    expect(spy).toHaveBeenCalledWith(KEY);
  });

  it('rejects a key the provider refuses, and a model the key cannot use', async () => {
    vi.spyOn(providers.claude, 'listModels').mockRejectedValue(new AiProviderError('auth'));
    const bad = await connect(stranger).expect(400);
    expect(bad.body.message).toMatch(/rejected the API key/);

    fakeModels();
    const wrong = await connect(stranger, { model: 'claude-made-up' }).expect(400);
    expect(wrong.body.message).toMatch(/doesn't offer/);
    expect(await db('ai_settings').where({ user_id: stranger.id }).first()).toBeUndefined();
  });

  it("keeps one person's key away from everyone else", async () => {
    const { body } = await stranger.agent.get(`${API}/ai/settings`).expect(200);
    expect(body.data.saved).toBeNull();
    // Without a key of their own, the stranger can't borrow the owner's.
    await stranger.agent.post(`${API}/ai/models`).send({ provider: 'claude' }).expect(400);
  });

  it('removes a saved key', async () => {
    const other = await createAccount();
    fakeModels();
    await connect(other).expect(200);
    await other.agent.delete(`${API}/ai/settings`).expect(200);
    expect(await db('ai_settings').where({ user_id: other.id }).first()).toBeUndefined();
  });
});

describe('receipt scanning', () => {
  let person;

  beforeAll(async () => {
    person = await createAccount();
  });

  it('asks for AI to be set up first', async () => {
    const { body } = await person.agent.post(`${API}/ai/receipts/scan`).attach('file', PNG, 'receipt.png').expect(400);
    expect(body.message).toMatch(/Set up AI in Settings/);
  });

  it('sends the photo with the saved key and returns form-ready fields', async () => {
    fakeModels();
    await connect(person).expect(200);
    const spy = vi.spyOn(providers.claude, 'generateJson').mockResolvedValue({
      readable: true, merchant: 'Maple Grocers', date: '2026-03-14', total: 42.5, currency: 'USD', category: 'groceries',
    });

    const { body } = await person.agent.post(`${API}/ai/receipts/scan`).attach('file', PNG, 'receipt.png').expect(200);
    expect(body.data).toMatchObject({ amount: 42.5, date: '2026-03-14', merchant: 'Maple Grocers', categoryName: 'Groceries' });

    const call = spy.mock.calls[0][0];
    expect(call).toMatchObject({ apiKey: KEY, model: 'claude-opus-5-5' });
    expect(call.image.mediaType).toBe('image/png');
    expect(call.prompt).toContain('Groceries');
  });

  it('refuses a file that is not an image', async () => {
    const spy = vi.spyOn(providers.claude, 'generateJson');
    await person.agent.post(`${API}/ai/receipts/scan`).attach('file', Buffer.from('%PDF-1.7 not an image at all'), 'receipt.png').expect(400);
    expect(spy).not.toHaveBeenCalled();
  });

  it("explains the provider's problem in plain words", async () => {
    vi.spyOn(providers.claude, 'generateJson').mockRejectedValue(new AiProviderError('quota'));
    const { body } = await person.agent.post(`${API}/ai/receipts/scan`).attach('file', PNG, 'receipt.png').expect(429);
    expect(body.message).toMatch(/usage limit or has no credit/);
  });
});

describe('monthly insights', () => {
  const month = '2026-03';
  let owner;
  let stranger;

  beforeAll(async () => {
    owner = await createAccount();
    stranger = await createAccount();
    const budget = await owner.agent.post(`${API}/budgets`).send({ name: 'Household', month, income: 3000, savingsGoal: 500 }).expect(201);
    await owner.agent.post(`${API}/budgets/${budget.body.data.id}/items`).send({ items: [{ categoryName: 'Dining Out', amount: 200 }] }).expect(201);
    await owner.agent.post(`${API}/expenses`).send({ categoryName: 'Dining Out', amount: 260, spentOn: `${month}-10` }).expect(201);
    for (const account of [owner, stranger]) {
      fakeModels();
      await connect(account).expect(200);
      vi.restoreAllMocks();
    }
  });

  it('explains the figures from the database and saves the result', async () => {
    const spy = vi.spyOn(providers.claude, 'generateJson').mockResolvedValue({
      summary: 'Dining out ran over plan.',
      points: [{ tone: 'warning', text: 'Dining Out is at 130% of its USD 200.00 plan.' }, { tone: 'loud', text: 'Odd tone.' }],
    });

    const { body } = await owner.agent.post(`${API}/ai/insights`).send({ month }).expect(200);
    expect(body.data.summary).toBe('Dining out ran over plan.');
    expect(body.data.points.map((point) => point.tone)).toEqual(['warning', 'neutral']);
    // The model is handed the real totals; it doesn't work them out.
    expect(spy.mock.calls[0][0].prompt).toContain('"spent":260');

    const saved = await owner.agent.get(`${API}/ai/insights`).query({ month }).expect(200);
    expect(saved.body.data.summary).toBe('Dining out ran over plan.');
  });

  it("never shows one account's insights to another", async () => {
    const { body } = await stranger.agent.get(`${API}/ai/insights`).query({ month }).expect(200);
    expect(body.data).toBeNull();
    const spy = vi.spyOn(providers.claude, 'generateJson');
    // The stranger has no budget that month, so there is nothing to explain.
    await stranger.agent.post(`${API}/ai/insights`).send({ month }).expect(404);
    expect(spy).not.toHaveBeenCalled();
    const kept = await owner.agent.get(`${API}/ai/insights`).query({ month }).expect(200);
    expect(kept.body.data.summary).toBe('Dining out ran over plan.');
  });

  it('reports an unreadable answer instead of saving it', async () => {
    vi.spyOn(providers.claude, 'generateJson').mockResolvedValue({ summary: '', points: [] });
    await owner.agent.post(`${API}/ai/insights`).send({ month }).expect(502);
    const kept = await owner.agent.get(`${API}/ai/insights`).query({ month }).expect(200);
    expect(kept.body.data.summary).toBe('Dining out ran over plan.');
  });
});

describe('AI on the public demo', () => {
  let visitor;

  beforeAll(async () => {
    env.DEMO_MODE = true;
    await resetDemoData();
    visitor = request.agent(app);
    await visitor.post(`${API}/auth/demo`).expect(200);
  });

  afterAll(() => {
    env.DEMO_MODE = false;
  });

  it('never saves a key on the shared account', async () => {
    fakeModels();
    await visitor.put(`${API}/ai/settings`).send({ provider: 'claude', model: 'claude-opus-5-5', apiKey: KEY }).expect(403);
    await visitor.delete(`${API}/ai/settings`).expect(403);
  });

  it("uses the visitor's own key for one request only", async () => {
    const missing = await visitor.post(`${API}/ai/receipts/scan`).attach('file', PNG, 'receipt.png').expect(400);
    expect(missing.body.message).toMatch(/your own API key/);

    const spy = vi.spyOn(providers.gemini, 'generateJson').mockResolvedValue({
      readable: true, merchant: 'Cafe', date: '2026-03-02', total: 9.5, currency: 'EUR', category: null,
    });
    await visitor
      .post(`${API}/ai/receipts/scan`)
      .set({ 'X-AI-Provider': 'gemini', 'X-AI-Model': 'gemini-3.6-flash', 'X-AI-Key': KEY })
      .attach('file', PNG, 'receipt.png')
      .expect(200);
    expect(spy.mock.calls[0][0]).toMatchObject({ apiKey: KEY, model: 'gemini-3.6-flash' });

    const demoUser = await db('users').where({ email: 'demo@budgetbook.dev' }).first('id');
    expect(await db('ai_settings').where({ user_id: demoUser.id }).first()).toBeUndefined();
  });
});

describe('switching provider', () => {
  it('requires the saved key to be removed before connecting another provider', async () => {
    const person = await createAccount();
    fakeModels();
    await connect(person).expect(200);

    vi.spyOn(providers.gemini, 'listModels').mockResolvedValue([{ id: 'gemini-3.6-flash', label: 'Gemini 3.6 Flash' }]);
    const blocked = await person.agent.put(`${API}/ai/settings`).send({ provider: 'gemini', model: 'gemini-3.6-flash', apiKey: KEY }).expect(409);
    expect(blocked.body.message).toMatch(/Remove your saved Claude \(Anthropic\) key first/);
    expect((await db('ai_settings').where({ user_id: person.id }).first()).provider).toBe('claude');

    // The same provider can still change its model.
    await person.agent.put(`${API}/ai/settings`).send({ provider: 'claude', model: 'claude-haiku-5-5' }).expect(200);

    await person.agent.delete(`${API}/ai/settings`).expect(200);
    const { body } = await person.agent.put(`${API}/ai/settings`).send({ provider: 'gemini', model: 'gemini-3.6-flash', apiKey: KEY }).expect(200);
    expect(body.data.provider).toBe('gemini');
  });
});

describe('usage and limits', () => {
  let person;
  const scan = () => person.agent.post(`${API}/ai/receipts/scan`).attach('file', PNG, 'receipt.png');
  const RECEIPT = { readable: true, merchant: 'Shop', date: '2026-03-02', total: 5, currency: 'USD', category: null };

  beforeAll(async () => {
    person = await createAccount();
    fakeModels();
    await connect(person).expect(200);
    vi.restoreAllMocks();
  });

  it('starts with no limits and nothing used', async () => {
    const { body } = await person.agent.get(`${API}/ai/usage`).expect(200);
    expect(body.data).toMatchObject({ limits: { daily: null, weekly: null }, daily: { used: 0 }, weekly: { used: 0 }, total: 0, recent: [] });
  });

  it('checks limits are sensible', async () => {
    await person.agent.put(`${API}/ai/limits`).send({ daily: 0, weekly: null }).expect(400);
    const lower = await person.agent.put(`${API}/ai/limits`).send({ daily: 10, weekly: 5 }).expect(400);
    expect(lower.body.message).toMatch(/weekly limit can't be lower/);
  });

  it('counts every request sent, stops at the daily limit and says when it frees up', async () => {
    await person.agent.put(`${API}/ai/limits`).send({ daily: 2, weekly: 50 }).expect(200);
    const spy = vi.spyOn(providers.claude, 'generateJson').mockResolvedValueOnce(RECEIPT).mockRejectedValueOnce(new AiProviderError('quota'));

    await scan().expect(200);
    await scan().expect(429); // The provider failed, but the request was sent, so it counts.
    const limited = await scan().expect(429);
    expect(limited.body.message).toMatch(/reached your daily AI limit of 2 requests\. The next one frees up in about 24 hours/);
    expect(spy).toHaveBeenCalledTimes(2);

    const { body } = await person.agent.get(`${API}/ai/usage`).expect(200);
    expect(body.data).toMatchObject({ daily: { used: 2, limit: 2 }, weekly: { used: 2, limit: 50 }, total: 2, failed: 1 });
    expect(body.data.recent.map((row) => row.ok)).toEqual([false, true]);
    expect(body.data.recent[0]).toMatchObject({ feature: 'receipt', provider: 'claude', model: 'claude-opus-5-5' });
  });

  it("doesn't count requests stopped before they are sent", async () => {
    await person.agent.put(`${API}/ai/limits`).send({ daily: null, weekly: null }).expect(200);
    await person.agent.post(`${API}/ai/receipts/scan`).attach('file', Buffer.from('not an image at all'), 'r.png').expect(400);
    await person.agent.post(`${API}/ai/insights`).send({ month: '2026-03' }).expect(404);
    const { body } = await person.agent.get(`${API}/ai/usage`).expect(200);
    expect(body.data.total).toBe(2);
  });

  it('applies the weekly limit too', async () => {
    await person.agent.put(`${API}/ai/limits`).send({ daily: null, weekly: 2 }).expect(200);
    const { body } = await scan().expect(429);
    expect(body.message).toMatch(/weekly AI limit of 2/);
  });

  it("keeps each person's usage and limits private", async () => {
    const other = await createAccount();
    const { body } = await other.agent.get(`${API}/ai/usage`).expect(200);
    expect(body.data).toMatchObject({ total: 0, limits: { daily: null, weekly: null }, recent: [] });
  });
});

describe('limits on the public demo', () => {
  it("can't be changed on the shared account", async () => {
    env.DEMO_MODE = true;
    await resetDemoData();
    const visitor = request.agent(app);
    await visitor.post(`${API}/auth/demo`).expect(200);
    await visitor.put(`${API}/ai/limits`).send({ daily: 1, weekly: null }).expect(403);
    env.DEMO_MODE = false;
  });
});
