import { randomBytes } from 'node:crypto';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import app from '../src/app.js';
import { env } from '../src/config/env.js';
import { migrate } from '../src/db/bootstrap.js';
import { db } from '../src/db/knex.js';
import { DEMO_EMAILS, DEMO_LOGIN_EMAIL, DEMO_PASSWORD, resetDemoData } from '../seeds/demo.js';

const API = '/api/v1';
const PASSWORD = 'Correct-horse-1';

async function createAccount() {
  const suffix = randomBytes(5).toString('hex');
  const email = `user_${suffix}@example.com`;
  const agent = request.agent(app);
  await agent.post(`${API}/auth/register`).send({ firstName: 'Real', lastName: 'Person', username: `user_${suffix}`, email, password: PASSWORD }).expect(201);
  const { body } = await agent.post(`${API}/auth/login`).send({ email, password: PASSWORD }).expect(200);
  return { agent, email, user: body.data.user };
}

async function demoSignIn() {
  const agent = request.agent(app);
  const { body } = await agent.post(`${API}/auth/demo`).expect(200);
  return { agent, body };
}

// Runs against the test database only (see vitest.config.js).
beforeAll(async () => {
  await migrate();
});

afterAll(async () => {
  env.DEMO_MODE = false;
  await db.destroy();
});

describe('demo mode', () => {
  let visitor;
  let real;

  beforeAll(async () => {
    real = await createAccount();
  });

  it('has no demo sign-in unless demo mode is on', async () => {
    env.DEMO_MODE = false;
    await request(app).post(`${API}/auth/demo`).expect(404);
    expect(real.user.isDemo).toBe(false);
  });

  it('signs a visitor in to the demo account with one click', async () => {
    env.DEMO_MODE = true;
    await resetDemoData();
    visitor = await demoSignIn();

    expect(visitor.body.data.user.email).toBe(DEMO_LOGIN_EMAIL);
    expect(visitor.body.data.user.isDemo).toBe(true);
    expect(visitor.body.data.organizations.map((org) => org.name)).toContain('Brightside Studio');
    const { body } = await visitor.agent.get(`${API}/reminders`).query({ status: 'open' }).expect(200);
    expect(body.data.total).toBeGreaterThan(0);
  });

  it('refuses changes that would lock other visitors out or send email', async () => {
    const { agent, body } = visitor;
    const message = /turned off in the demo/;

    const profile = await agent.patch(`${API}/auth/me`).send({ firstName: 'X', lastName: 'Y', username: 'taken_over', email: 'attacker@example.com', currency: 'USD' }).expect(403);
    expect(profile.body.message).toMatch(message);
    await agent.post(`${API}/auth/me/password`).send({ currentPassword: DEMO_PASSWORD, newPassword: 'Another-pass-1' }).expect(403);
    await agent.post(`${API}/auth/me/avatar`).attach('file', Buffer.from('x'), 'a.png').expect(403);

    const organizationId = body.data.organizations[0].id;
    await agent.post(`${API}/organizations/${organizationId}/invitations`).send({ email: 'stranger@example.com', role: 'member' }).expect(403);

    // The shared password still works, so the next visitor can get in.
    await request(app).post(`${API}/auth/login`).send({ email: DEMO_LOGIN_EMAIL, password: DEMO_PASSWORD }).expect(200);
  });

  it('still lets a visitor try the app itself', async () => {
    await visitor.agent.post(`${API}/notes`).send({ body: 'Visitor note' }).expect(201);
    await visitor.agent.patch(`${API}/auth/me/preferences`).send({ currency: 'EUR' }).expect(200);
  });

  it('shows the demo admin only demo accounts and lets it change nothing', async () => {
    const admin = request.agent(app);
    await admin.post(`${API}/auth/login`).send({ email: 'admin@budgetbook.dev', password: DEMO_PASSWORD }).expect(200);

    const { body } = await admin.get(`${API}/admin/users`).expect(200);
    const emails = body.data.map((user) => user.email);
    expect(emails).not.toContain(real.email);
    expect(emails.every((email) => DEMO_EMAILS.includes(email))).toBe(true);

    await admin.patch(`${API}/admin/users/${real.user.id}`).send({ role: 'admin' }).expect(403);
    await admin.delete(`${API}/admin/users/${real.user.id}`).expect(403);
    await admin.get(`${API}/categories`).expect(200);
    await admin.post(`${API}/categories`).send({ name: 'Demo vandalism' }).expect(403);
    expect(await db('users').where({ id: real.user.id }).first('role')).toEqual({ role: 'user' });
  });

  it('sends no reset email for a demo address', async () => {
    const demoUser = await db('users').where({ email: DEMO_LOGIN_EMAIL }).first('id');
    await request(app).post(`${API}/auth/forgot-password`).send({ email: DEMO_LOGIN_EMAIL }).expect(200);
    expect(await db('password_reset_tokens').where({ user_id: demoUser.id }).count({ n: '*' }).first()).toEqual({ n: 0 });
  });

  it('nightly reset restores the demo and leaves real accounts alone', async () => {
    await real.agent.post(`${API}/notes`).send({ body: 'My own note' }).expect(201);

    await resetDemoData();

    // The old demo session belonged to the removed copy of the account.
    await visitor.agent.get(`${API}/notes`).expect(401);
    const fresh = await demoSignIn();
    expect(fresh.body.data.user.currency).not.toBe('EUR');
    const notes = await fresh.agent.get(`${API}/notes`).expect(200);
    expect(notes.body.data.map((note) => note.body)).not.toContain('Visitor note');
    expect(fresh.body.data.organizations.filter((org) => org.name === 'Brightside Studio')).toHaveLength(1);

    const own = await real.agent.get(`${API}/notes`).expect(200);
    expect(own.body.data.map((note) => note.body)).toEqual(['My own note']);
    expect(await db('users').whereIn('email', DEMO_EMAILS).count({ n: '*' }).first()).toEqual({ n: DEMO_EMAILS.length });
  });

  it('does not lock real accounts', async () => {
    await real.agent.patch(`${API}/auth/me/preferences`).send({ currency: 'GBP' }).expect(200);
    const { body } = await real.agent.get(`${API}/auth/me`).expect(200);
    expect(body.data.user.isDemo).toBe(false);
  });
});
