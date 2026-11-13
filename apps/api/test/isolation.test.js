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
  const email = `user_${suffix}@example.com`;
  const username = `user_${suffix}`;
  const agent = request.agent(app);
  await agent.post(`${API}/auth/register`).send({ firstName: 'Test', lastName: 'User', username, email, password: PASSWORD }).expect(201);
  const { body } = await agent.post(`${API}/auth/login`).send({ email, password: PASSWORD }).expect(200);
  return { agent, email, username, id: body.data.user.id };
}

// Closed once for the whole file: every suite below shares this connection pool.
afterAll(() => db.destroy());

describe('account isolation', () => {
  let owner;
  let stranger;
  const ids = {};
  const month = '2026-03';

  beforeAll(async () => {
    await migrate();
    owner = await createAccount();
    stranger = await createAccount();

    const budget = await owner.agent.post(`${API}/budgets`).send({ name: 'Household', month, income: 1000, savingsGoal: 100 }).expect(201);
    ids.budget = budget.body.data.id;
    const detail = await owner.agent.post(`${API}/budgets/${ids.budget}/items`).send({ items: [{ categoryName: 'Groceries', amount: 200 }] }).expect(201);
    ids.item = detail.body.data.items[0].id;
    const expense = await owner.agent.post(`${API}/expenses`).send({ categoryName: 'Groceries', amount: 50, spentOn: `${month}-05` }).expect(201);
    ids.expense = expense.body.data.id;
    const transaction = await owner.agent
      .post(`${API}/transactions`)
      .send({ type: 'sent', date: `${month}-05`, amount: 10, sender: 'A', receiver: 'B', method: 'Card' })
      .expect(201);
    ids.transaction = transaction.body.data.id;
    const reminder = await owner.agent.post(`${API}/reminders`).send({ title: 'Secret', dueDate: `${month}-20` }).expect(201);
    ids.reminder = reminder.body.data.id;
    const note = await owner.agent.post(`${API}/notes`).send({ body: 'Secret' }).expect(201);
    ids.note = note.body.data.id;
  });

  it('rejects requests without a session', async () => {
    await request(app).get(`${API}/budgets`).expect(401);
    await request(app).get(`${API}/admin/users`).expect(401);
  });

  it('hides every record from another account', async () => {
    const paths = [
      ['get', `/budgets/${ids.budget}`],
      ['patch', `/budgets/${ids.budget}`, { name: 'Hacked', income: 1, savingsGoal: 0 }],
      ['delete', `/budgets/${ids.budget}`],
      ['post', `/budgets/${ids.budget}/items`, { items: [{ categoryName: 'Hack', amount: 1 }] }],
      ['patch', `/budgets/${ids.budget}/items/${ids.item}`, { amount: 1 }],
      ['delete', `/budgets/${ids.budget}/items/${ids.item}`],
      ['patch', `/expenses/${ids.expense}`, { categoryName: 'Hack', amount: 1, spentOn: `${month}-01` }],
      ['delete', `/expenses/${ids.expense}`],
      ['patch', `/transactions/${ids.transaction}`, { type: 'sent', date: `${month}-01`, amount: 1, sender: 'X', receiver: 'Y', method: 'Z' }],
      ['delete', `/transactions/${ids.transaction}`],
      ['patch', `/reminders/${ids.reminder}`, { title: 'Hacked' }],
      ['delete', `/reminders/${ids.reminder}`],
      ['patch', `/notes/${ids.note}`, { body: 'Hacked' }],
      ['delete', `/notes/${ids.note}`],
    ];
    for (const [method, path, body] of paths) {
      await stranger.agent[method](`${API}${path}`).send(body).expect(404);
    }
  });

  it("leaves another account's lists and totals empty", async () => {
    const [budgets, transactions, reminders, notes, expenses] = await Promise.all([
      stranger.agent.get(`${API}/budgets`),
      stranger.agent.get(`${API}/transactions`),
      stranger.agent.get(`${API}/reminders`),
      stranger.agent.get(`${API}/notes`),
      stranger.agent.get(`${API}/expenses?month=${month}`),
    ]);
    expect(budgets.body.data).toEqual([]);
    expect(transactions.body.data.total).toBe(0);
    expect(reminders.body.data).toEqual([]);
    expect(notes.body.data).toEqual([]);
    expect(expenses.body.data.items).toEqual([]);
  });

  it('does not change other accounts when spending in a shared category name', async () => {
    await stranger.agent.post(`${API}/budgets`).send({ name: 'Household', month, income: 500, savingsGoal: 0 }).expect(201);
    await stranger.agent.post(`${API}/expenses`).send({ categoryName: 'Groceries', amount: 999, spentOn: `${month}-06` }).expect(201);
    const { body } = await owner.agent.get(`${API}/budgets/${ids.budget}`).expect(200);
    expect(body.data.items[0].spent).toBe(50);
  });

  it('counts spending in months with fewer than 31 days', async () => {
    const { body: created } = await owner.agent.post(`${API}/budgets`).send({ name: 'Household', month: '2026-04', income: 1000, savingsGoal: 0 }).expect(201);
    await owner.agent.post(`${API}/budgets/${created.data.id}/items`).send({ items: [{ categoryName: 'Fuel', amount: 100 }] }).expect(201);
    await owner.agent.post(`${API}/expenses`).send({ categoryName: 'Fuel', amount: 40, spentOn: '2026-04-30' }).expect(201);

    const { body } = await owner.agent.get(`${API}/budgets/${created.data.id}`).expect(200);
    expect(body.data.spent).toBe(40);
    expect(body.data.items[0].remaining).toBe(60);
  });

  it('searches transactions without caring about letter case', async () => {
    const { body } = await owner.agent.get(`${API}/transactions?search=CARD`).expect(200);
    expect(body.data.total).toBe(1);
  });

  it('never returns password hashes', async () => {
    const { text } = await owner.agent.get(`${API}/auth/me`).expect(200);
    expect(text).not.toContain('password');
  });

  it('blocks non-admins from admin routes and self-promotion', async () => {
    await stranger.agent.get(`${API}/admin/users`).expect(403);
    await stranger.agent.patch(`${API}/admin/users/${stranger.id}`).send({ role: 'admin' }).expect(403);
    await stranger.agent.delete(`${API}/admin/users/${owner.id}`).expect(403);
    await stranger.agent.post(`${API}/categories`).send({ name: 'Hack' }).expect(403);
  });

  it('ignores extra fields such as role when registering', async () => {
    const suffix = randomBytes(5).toString('hex');
    const email = `mass_${suffix}@example.com`;
    await request(app)
      .post(`${API}/auth/register`)
      .send({ firstName: 'A', lastName: 'B', username: `mass_${suffix}`, email, password: PASSWORD, role: 'admin' })
      .expect(201);
    const user = await db('users').where({ email }).first();
    expect(user.role).toBe('user');
  });
});

describe('named budgets', () => {
  let owner;
  let stranger;
  let home;
  let trip;
  const month = '2026-05';
  const createBudget = (account, body) => account.agent.post(`${API}/budgets`).send({ month, income: 0, savingsGoal: 0, ...body });

  beforeAll(async () => {
    owner = await createAccount();
    stranger = await createAccount();
    home = (await createBudget(owner, { name: 'Home', income: 2000 }).expect(201)).body.data.id;
    trip = (await createBudget(owner, { name: 'Trip' }).expect(201)).body.data.id;
    for (const id of [home, trip]) {
      await owner.agent.post(`${API}/budgets/${id}/items`).send({ items: [{ categoryName: 'Groceries', amount: 100 }] }).expect(201);
    }
  });

  it('allows several budgets in a month, but not two with the same name', async () => {
    await createBudget(owner, { name: 'home' }).expect(409);
    const { body } = await owner.agent.get(`${API}/budgets?month=${month}`).expect(200);
    expect(body.data.map((budget) => budget.name)).toEqual(['Home', 'Trip']);
  });

  it('counts each expense only toward its own budget', async () => {
    await owner.agent.post(`${API}/expenses`).send({ categoryName: 'Groceries', amount: 30, spentOn: `${month}-04`, budgetId: home }).expect(201);
    await owner.agent.post(`${API}/expenses`).send({ categoryName: 'Groceries', amount: 20, spentOn: `${month}-05`, budgetId: trip }).expect(201);

    const homeDetail = (await owner.agent.get(`${API}/budgets/${home}`)).body.data;
    expect(homeDetail.spent).toBe(30);
    expect(homeDetail.recentExpenses.map((expense) => expense.amount)).toEqual([30]);
    expect((await owner.agent.get(`${API}/budgets/${trip}`)).body.data.spent).toBe(20);

    const { body } = await owner.agent.get(`${API}/dashboard?month=${month}`).expect(200);
    expect(body.data.budgetCount).toBe(2);
    expect(body.data.kpis.planned).toBe(200);
    expect(body.data.kpis.spent).toBe(50);
  });

  it('leaves an expense unassigned when the month has several budgets and none is chosen', async () => {
    const { body } = await owner.agent.post(`${API}/expenses`).send({ categoryName: 'Fuel', amount: 5, spentOn: `${month}-06` }).expect(201);
    expect(body.data.budgetId).toBeNull();
  });

  it('rejects a budget from another account or from a different month', async () => {
    await stranger.agent.post(`${API}/expenses`).send({ categoryName: 'Fuel', amount: 5, spentOn: `${month}-06`, budgetId: home }).expect(404);
    await owner.agent.post(`${API}/expenses`).send({ categoryName: 'Fuel', amount: 5, spentOn: '2026-06-01', budgetId: home }).expect(400);
    await createBudget(stranger, { name: 'Copy', copyFromId: home }).expect(404);
  });

  it('copies categories from an existing budget', async () => {
    const { body } = await createBudget(owner, { name: 'Home', month: '2026-06', copyFromId: home }).expect(201);
    const detail = await owner.agent.get(`${API}/budgets/${body.data.id}`).expect(200);
    expect(detail.body.data.items.map((item) => item.categoryName)).toEqual(['Groceries']);
  });

  it('filters by year and lists only your own years', async () => {
    await createBudget(owner, { name: 'Old', month: '2024-03' }).expect(201);
    const inYear = await owner.agent.get(`${API}/budgets?year=2026`).expect(200);
    expect(inYear.body.data.every((budget) => budget.month.startsWith('2026'))).toBe(true);

    const years = await owner.agent.get(`${API}/budgets/years`).expect(200);
    expect(years.body.data).toEqual([2026, 2024]);
    const strangerYears = await stranger.agent.get(`${API}/budgets/years`).expect(200);
    expect(strangerYears.body.data).toEqual([]);
  });

  it('keeps expenses when their budget is deleted', async () => {
    await owner.agent.delete(`${API}/budgets/${trip}`).expect(200);
    const { body } = await owner.agent.get(`${API}/expenses?month=${month}`).expect(200);
    expect(body.data.items.find((expense) => expense.amount === 20).budgetId).toBeNull();
  });
});

describe('expense summary', () => {
  let owner;
  let stranger;
  const month = '2026-07';

  beforeAll(async () => {
    owner = await createAccount();
    stranger = await createAccount();
    const budget = (await owner.agent.post(`${API}/budgets`).send({ name: 'Home', month, income: 0, savingsGoal: 0 }).expect(201)).body.data.id;
    await owner.agent.post(`${API}/budgets/${budget}/items`).send({ items: [{ categoryName: 'Fuel', amount: 100 }] }).expect(201);
    const add = (categoryName, amount, day, description = '') =>
      owner.agent.post(`${API}/expenses`).send({ categoryName, amount, description, spentOn: `${month}-${day}` }).expect(201);
    await add('Fuel', 30, '02', 'Petrol');
    await add('Fuel', 20, '09');
    await add('Car wash', 15, '09', 'Weekend wash');
    for (let index = 1; index <= 11; index += 1) await add(`Category ${index}`, index, '10');
  });

  it('shows each category once, with its total, count and limit', async () => {
    const { body } = await owner.agent.get(`${API}/expenses/summary?month=${month}&limit=3`).expect(200);
    const fuel = body.data.categories.items.find((item) => item.categoryName === 'Fuel');
    expect(fuel).toMatchObject({ total: 50, count: 2, planned: 100, lastSpentOn: `${month}-09` });
    const names = body.data.categories.items.map((item) => item.categoryName);
    expect(new Set(names).size).toBe(names.length);
    expect(body.data.categories.total).toBe(13);
    expect(body.data.totals).toMatchObject({ spent: 131, count: 14, monthSpent: 131 });
  });

  it('pages through categories and expenses', async () => {
    const second = await owner.agent.get(`${API}/expenses/summary?month=${month}&limit=10&page=2`).expect(200);
    expect(second.body.data.categories.items).toHaveLength(3);
    const list = await owner.agent.get(`${API}/expenses?month=${month}&category=Fuel&limit=1&page=2`).expect(200);
    expect(list.body.data).toMatchObject({ total: 2, page: 2 });
    expect(list.body.data.items).toHaveLength(1);
  });

  it('filters by search and by day', async () => {
    const search = await owner.agent.get(`${API}/expenses/summary?month=${month}&search=wash`).expect(200);
    expect(search.body.data.categories.items.map((item) => item.categoryName)).toEqual(['Car wash']);
    const day = await owner.agent.get(`${API}/expenses/summary?month=${month}&day=${month}-09&search=`).expect(200);
    expect(day.body.data.totals.spent).toBe(35);
    expect(day.body.data.daily.length).toBeGreaterThan(1);
  });

  it('includes nothing from another account', async () => {
    const { body } = await stranger.agent.get(`${API}/expenses/summary?month=${month}`).expect(200);
    expect(body.data.totals.count).toBe(0);
    expect(body.data.categories.items).toEqual([]);
  });
});

describe('split groups', () => {
  let alice;
  let bob;
  let outsider;
  let groupId;

  beforeAll(async () => {
    alice = await createAccount();
    bob = await createAccount();
    outsider = await createAccount();
    await alice.agent.post(`${API}/splits/contacts`).send({ username: bob.username }).expect(201);
    await alice.agent.post(`${API}/splits/groups`).send({ name: 'Trip', members: [bob.username] }).expect(201);
    const { body } = await alice.agent.get(`${API}/splits/groups`).expect(200);
    groupId = body.data[0].id;
  });

  it('keeps groups private to their members', async () => {
    const { body } = await outsider.agent.get(`${API}/splits/groups`).expect(200);
    expect(body.data).toEqual([]);
    await outsider.agent.get(`${API}/splits/groups/${groupId}`).expect(404);
    await outsider.agent.post(`${API}/splits/groups/${groupId}/bills`).send({ amount: 10, mode: 'equal' }).expect(404);
    await outsider.agent.delete(`${API}/splits/groups/${groupId}`).expect(404);
  });

  it('only lets the creator delete a group', async () => {
    await bob.agent.delete(`${API}/splits/groups/${groupId}`).expect(403);
  });

  it('splits and settles exactly', async () => {
    await alice.agent.post(`${API}/splits/groups/${groupId}/bills`).send({ amount: 100.01, mode: 'equal' }).expect(201);
    const { body } = await bob.agent.get(`${API}/splits/groups/${groupId}`).expect(200);
    const balances = body.data.members.map((member) => member.balance);
    expect(balances.reduce((sum, value) => sum + value, 0)).toBeCloseTo(100.01, 2);

    await bob.agent.post(`${API}/splits/groups/${groupId}/settle`).send({ amount: 9999 }).expect(400);
  });
});

describe('organizations', () => {
  let owner;
  let member;
  let outsider;
  let organizationId;
  const header = () => ({ 'X-Organization-Id': String(organizationId) });

  beforeAll(async () => {
    owner = await createAccount();
    member = await createAccount();
    outsider = await createAccount();
    const { body } = await owner.agent.post(`${API}/organizations`).send({ name: 'Team', currency: 'USD' }).expect(201);
    organizationId = body.data.id;
    const invite = await owner.agent.post(`${API}/organizations/${organizationId}/invitations`).send({ email: member.email, role: 'member' }).expect(201);
    const token = invite.body.data.inviteUrl.split('/').pop();

    await outsider.agent.post(`${API}/organizations/invitations/accept`).send({ token }).expect(403);
    await member.agent.post(`${API}/organizations/invitations/accept`).send({ token }).expect(200);
  });

  it('rejects non-members from organization data', async () => {
    await outsider.agent.get(`${API}/budgets`).set(header()).expect(403);
    await outsider.agent.get(`${API}/organizations/${organizationId}`).expect(404);
  });

  it('keeps team and personal data separate', async () => {
    await owner.agent.post(`${API}/notes`).set(header()).send({ body: 'Team note' }).expect(201);
    const team = await member.agent.get(`${API}/notes`).set(header()).expect(200);
    expect(team.body.data).toHaveLength(1);
    const personal = await member.agent.get(`${API}/notes`).expect(200);
    expect(personal.body.data).toEqual([]);
  });

  it('limits budgets and member management to managers', async () => {
    await member.agent.post(`${API}/budgets`).set(header()).send({ month: '2026-04', income: 1, savingsGoal: 0 }).expect(403);
    await member.agent.post(`${API}/organizations/${organizationId}/invitations`).send({ email: 'x@example.com', role: 'admin' }).expect(403);
    await member.agent.delete(`${API}/organizations/${organizationId}`).expect(403);
  });

  it('lets only managers change the organization currency', async () => {
    await member.agent.patch(`${API}/organizations/${organizationId}`).send({ name: 'Team', currency: 'EUR' }).expect(403);
    await owner.agent.patch(`${API}/organizations/${organizationId}`).send({ name: 'Team', currency: 'EUR' }).expect(200);
    const { body } = await member.agent.get(`${API}/organizations`).expect(200);
    expect(body.data[0].currency).toBe('EUR');
  });

  it('does not allow anyone to become owner by role change', async () => {
    await owner.agent.patch(`${API}/organizations/${organizationId}/members/${member.id}`).send({ role: 'owner' }).expect(400);
  });
});

describe('sessions and feeds', () => {
  it('invalidates older sessions after a password change', async () => {
    const account = await createAccount();
    const otherDevice = request.agent(app);
    await otherDevice.post(`${API}/auth/login`).send({ email: account.email, password: PASSWORD }).expect(200);

    await account.agent.post(`${API}/auth/me/password`).send({ currentPassword: PASSWORD, newPassword: 'Another-pass-2' }).expect(200);

    await otherDevice.get(`${API}/auth/me`).expect(401);
    await account.agent.get(`${API}/auth/me`).expect(200);
  });

  it('saves a personal currency and rejects unknown ones', async () => {
    const account = await createAccount();
    const { body } = await account.agent.patch(`${API}/auth/me/preferences`).send({ currency: 'PKR' }).expect(200);
    expect(body.data.currency).toBe('PKR');
    await account.agent.patch(`${API}/auth/me/preferences`).send({ currency: 'XYZ' }).expect(400);
    await request(app).patch(`${API}/auth/me/preferences`).send({ currency: 'EUR' }).expect(401);
  });

  it('serves feeds only with a valid token', async () => {
    const account = await createAccount();
    await account.agent.post(`${API}/reminders`).send({ title: 'Rent', dueDate: '2026-05-01' }).expect(201);
    const { body } = await account.agent.post(`${API}/integrations/feeds`).send({ kind: 'calendar' }).expect(201);
    const path = new URL(body.data.url).pathname;

    const feed = await request(app).get(path).expect(200);
    expect(feed.text).toContain('SUMMARY:Rent');
    await request(app).get(`/feeds/${'0'.repeat(64)}/reminders.ics`).expect(404);
  });

  it('refuses webhooks aimed at private addresses', async () => {
    const account = await createAccount();
    await account.agent
      .post(`${API}/integrations/webhooks`)
      .send({ name: 'Bad', provider: 'generic', url: 'https://169.254.169.254/latest', events: ['expense.created'] })
      .expect(400);
  });

  it('rejects avatars that are not really images', async () => {
    const account = await createAccount();
    await account.agent
      .post(`${API}/auth/me/avatar`)
      .attach('file', Buffer.from('<script>alert(1)</script>'), { filename: 'x.png', contentType: 'image/png' })
      .expect(400);
  });
});
