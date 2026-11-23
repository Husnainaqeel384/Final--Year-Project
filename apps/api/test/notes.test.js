import { randomBytes } from 'node:crypto';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import app from '../src/app.js';
import { migrate } from '../src/db/bootstrap.js';
import { db } from '../src/db/knex.js';

const API = '/api/v1';
const PASSWORD = 'Correct-horse-1';

async function createAccount() {
  const suffix = randomBytes(5).toString('hex');
  const email = `notes_${suffix}@example.com`;
  const agent = request.agent(app);
  await agent.post(`${API}/auth/register`).send({ firstName: 'Note', lastName: 'Taker', username: `notes_${suffix}`, email, password: PASSWORD }).expect(201);
  await agent.post(`${API}/auth/login`).send({ email, password: PASSWORD }).expect(200);
  return agent;
}

beforeAll(async () => {
  await migrate();
});

afterAll(() => db.destroy());

describe('notes', () => {
  let owner;
  let stranger;
  const ids = {};

  beforeAll(async () => {
    owner = await createAccount();
    stranger = await createAccount();
    ids.plain = (await owner.post(`${API}/notes`).send({ body: 'Cancel the unused streaming plan.' }).expect(201)).body.data.id;
    const titled = await owner.post(`${API}/notes`).send({ title: '  Holiday fund  ', body: 'Save 150 a month from March.', pinned: true }).expect(201);
    ids.titled = titled.body.data.id;
    expect(titled.body.data).toMatchObject({ title: 'Holiday fund', pinned: true });
  });

  it('lists pinned notes first, then the most recent', async () => {
    await owner.post(`${API}/notes`).send({ body: 'Newest, but not pinned.' }).expect(201);
    const { body } = await owner.get(`${API}/notes`).expect(200);
    expect(body.data[0]).toMatchObject({ id: ids.titled, pinned: true });
    expect(body.data[1].body).toBe('Newest, but not pinned.');
    expect(body.data.find((note) => note.id === ids.plain)).toMatchObject({ title: '', pinned: false });
  });

  it('searches titles and text', async () => {
    const byTitle = await owner.get(`${API}/notes`).query({ search: 'holiday' }).expect(200);
    expect(byTitle.body.data.map((note) => note.id)).toEqual([ids.titled]);
    const byBody = await owner.get(`${API}/notes`).query({ search: 'streaming' }).expect(200);
    expect(byBody.body.data.map((note) => note.id)).toEqual([ids.plain]);
    const none = await owner.get(`${API}/notes`).query({ search: 'nothing like this' }).expect(200);
    expect(none.body.data).toEqual([]);
  });

  it('pins without changing the edited date', async () => {
    const before = (await db('notes').where({ id: ids.plain }).first()).updated_at;
    const { body } = await owner.patch(`${API}/notes/${ids.plain}`).send({ pinned: true }).expect(200);
    expect(body.data).toMatchObject({ pinned: true, body: 'Cancel the unused streaming plan.' });
    expect((await db('notes').where({ id: ids.plain }).first()).updated_at).toEqual(before);
  });

  it('edits the title and text, and clears a title', async () => {
    await owner.patch(`${API}/notes/${ids.titled}`).send({ title: 'Trip fund', body: 'Save 200 a month.' }).expect(200);
    const { body } = await owner.patch(`${API}/notes/${ids.titled}`).send({ title: '' }).expect(200);
    expect(body.data).toMatchObject({ title: '', body: 'Save 200 a month.', pinned: true });
  });

  it('rejects a title that is too long or an empty note', async () => {
    await owner.post(`${API}/notes`).send({ title: 'x'.repeat(121), body: 'Text' }).expect(400);
    await owner.post(`${API}/notes`).send({ title: 'Only a title', body: '   ' }).expect(400);
  });

  it("can't be pinned, edited or found by another account", async () => {
    await stranger.patch(`${API}/notes/${ids.titled}`).send({ pinned: false }).expect(404);
    await stranger.patch(`${API}/notes/${ids.titled}`).send({ title: 'Mine now' }).expect(404);
    const { body } = await stranger.get(`${API}/notes`).query({ search: 'Save' }).expect(200);
    expect(body.data).toEqual([]);
    expect((await db('notes').where({ id: ids.titled }).first()).pinned).toBeTruthy();
  });
});

describe('switched-off features', () => {
  it("doesn't serve bill splitting while it is switched off", async () => {
    const agent = await createAccount();
    await agent.get(`${API}/splits/groups`).expect(404);
  });
});
