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
      ['post', `/reminders/${ids.reminder}/complete`, { completedOn: `${month}-20` }],
      ['post', `/reminders/${ids.reminder}/reopen`],
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
    expect(reminders.body.data.items).toEqual([]);
    expect(reminders.body.data.counts).toEqual({ open: 0, done: 0 });
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
    const { body } = await owner.agent.get(`${API}/expenses/summary?month=${month}&limit=20`).expect(200);
    const fuel = body.data.categories.items.find((item) => item.categoryName === 'Fuel');
    expect(fuel).toMatchObject({ total: 50, count: 2, planned: 100, lastSpentOn: `${month}-09` });
    const names = body.data.categories.items.map((item) => item.categoryName);
    expect(new Set(names).size).toBe(names.length);
    expect(body.data.categories.total).toBe(13);
    expect(body.data.totals).toMatchObject({ spent: 131, count: 14, monthSpent: 131 });
  });

  it('lists the category with the latest expense first', async () => {
    const { body } = await owner.agent.get(`${API}/expenses/summary?month=${month}&limit=20`).expect(200);
    const names = body.data.categories.items.map((item) => item.categoryName);
    // Day 10 is the latest date, and "Category 11" was the last one added that day.
    expect(names[0]).toBe('Category 11');
    // Fuel and Car wash both last spent on day 9; the Car wash expense was added after Fuel's.
    expect(names.slice(-2)).toEqual(['Car wash', 'Fuel']);
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

describe('transactions linked to budgets', () => {
  let owner;
  let stranger;
  let budgetId;
  const month = '2026-08';
  const payment = (overrides = {}) => ({
    type: 'sent',
    date: `${month}-05`,
    amount: 40,
    sender: 'Me',
    receiver: 'City Utilities',
    method: 'Bank',
    budgetId,
    categoryName: 'Electricity',
    ...overrides,
  });
  const budget = () => owner.agent.get(`${API}/budgets/${budgetId}`).expect(200).then((res) => res.body.data);

  beforeAll(async () => {
    owner = await createAccount();
    stranger = await createAccount();
    budgetId = (await owner.agent.post(`${API}/budgets`).send({ name: 'Home', month, income: 1000, savingsGoal: 0 }).expect(201)).body.data.id;
    await owner.agent.post(`${API}/budgets/${budgetId}/items`).send({ items: [{ categoryName: 'Electricity', amount: 100 }] }).expect(201);
  });

  it('turns a sent payment into an expense and keeps it in step', async () => {
    const { body } = await owner.agent.post(`${API}/transactions`).send(payment()).expect(201);
    const id = body.data.id;
    expect(body.data).toMatchObject({ budgetId, budgetName: 'Home', categoryName: 'Electricity' });
    expect((await budget()).items[0].spent).toBe(40);

    await owner.agent.patch(`${API}/transactions/${id}`).send(payment({ amount: 55 })).expect(200);
    expect((await budget()).items[0].spent).toBe(55);

    const expenses = await owner.agent.get(`${API}/expenses?month=${month}`).expect(200);
    const mirrored = expenses.body.data.items.find((expense) => expense.transactionId === id);
    expect(mirrored).toMatchObject({ amount: 55, description: 'Paid to City Utilities' });
    // The mirror can only be changed through its transaction.
    await owner.agent.delete(`${API}/expenses/${mirrored.id}`).expect(409);

    await owner.agent.delete(`${API}/transactions/${id}`).expect(200);
    expect((await budget()).items[0].spent).toBe(0);
  });

  it('counts pending only once it is sent, and received as income', async () => {
    const pending = (await owner.agent.post(`${API}/transactions`).send(payment({ type: 'pending' })).expect(201)).body.data;
    expect((await budget()).spent).toBe(0);
    await owner.agent.patch(`${API}/transactions/${pending.id}`).send(payment()).expect(200);
    expect((await budget()).spent).toBe(40);

    await owner.agent.post(`${API}/transactions`).send(payment({ type: 'received', amount: 900, categoryName: null })).expect(201);
    const detail = await budget();
    expect(detail.incomeReceived).toBe(900);
    expect(detail.spent).toBe(40);
  });

  it('needs a category for money out, and a budget in the same month', async () => {
    await owner.agent.post(`${API}/transactions`).send(payment({ categoryName: null })).expect(400);
    await owner.agent.post(`${API}/transactions`).send(payment({ date: '2026-09-01' })).expect(400);
  });

  it("refuses another account's budget", async () => {
    await stranger.agent.post(`${API}/transactions`).send(payment()).expect(404);
  });

  it('filters by month and budget, with money in and out totals', async () => {
    const { body } = await owner.agent.get(`${API}/transactions?month=${month}&budget=${budgetId}`).expect(200);
    expect(body.data.totals).toMatchObject({ received: 900, sent: 40 });
    expect(body.data.totals.net).toBe(860);
    const sentOnly = await owner.agent.get(`${API}/transactions?month=${month}&type=sent`).expect(200);
    expect(sentOnly.body.data.items.every((item) => item.type === 'sent')).toBe(true);
    // Totals ignore the type filter so both figures stay visible.
    expect(sentOnly.body.data.totals.received).toBe(900);
  });
});

describe('reminders', () => {
  let owner;
  let stranger;
  let budgetId;
  const month = '2026-10';
  const today = `${month}-10`;
  const list = (query = '') =>
    owner.agent.get(`${API}/reminders?today=${today}${query}`).expect(200).then((res) => res.body.data);
  const add = (body) => owner.agent.post(`${API}/reminders`).send(body).expect(201).then((res) => res.body.data);

  beforeAll(async () => {
    owner = await createAccount();
    stranger = await createAccount();
    budgetId = (await owner.agent.post(`${API}/budgets`).send({ name: 'Home', month, income: 2000, savingsGoal: 0 }).expect(201)).body.data.id;
    await owner.agent.post(`${API}/budgets/${budgetId}/items`).send({ items: [{ categoryName: 'Internet', amount: 50 }] }).expect(201);
  });

  it('saves bill details and sums what is overdue and coming up', async () => {
    const internet = await add({ title: 'Internet', dueDate: `${month}-08`, amount: 45, categoryName: 'Internet', frequency: 'monthly', note: 'Fiber plan' });
    expect(internet).toMatchObject({ amount: 45, categoryName: 'Internet', frequency: 'monthly', note: 'Fiber plan', status: 'pending' });
    await add({ title: 'Water', dueDate: `${month}-12`, amount: 30 });
    await add({ title: 'Passport', dueDate: '2026-12-01' });

    const data = await list();
    expect(data.items.map((item) => item.title)).toEqual(['Internet', 'Water', 'Passport']);
    expect(data.summary.overdue).toEqual({ count: 1, amount: 45 });
    expect(data.summary.week).toEqual({ count: 1, amount: 30 });
    expect(data.counts).toEqual({ open: 3, done: 0 });
    expect((await list('&search=fiber')).items.map((item) => item.title)).toEqual(['Internet']);
  });

  it('records the payment in a budget and opens next month', async () => {
    const internet = (await list('&search=Internet')).items[0];
    const { body } = await owner.agent
      .post(`${API}/reminders/${internet.id}/complete`)
      .send({ completedOn: today, payment: { amount: 47.5, paidTo: 'FiberNet', method: 'Card', budgetId, categoryName: 'Internet' } })
      .expect(200);

    expect(body.data.reminder).toMatchObject({ status: 'done', completedOn: today, paidAmount: 47.5, budgetName: 'Home' });
    expect(body.data.next).toMatchObject({ title: 'Internet', dueDate: '2026-11-08', status: 'pending', amount: 45 });
    expect(body.data.transaction).toMatchObject({ type: 'sent', amount: 47.5, receiver: 'FiberNet', sender: 'Test User' });

    const detail = (await owner.agent.get(`${API}/budgets/${budgetId}`).expect(200)).body.data;
    expect(detail.items.find((item) => item.categoryName === 'Internet').spent).toBe(47.5);

    const data = await list();
    expect(data.summary.paid).toEqual({ count: 1, amount: 47.5 });
    expect((await list('&status=done')).items.map((item) => item.title)).toEqual(['Internet']);
    await owner.agent.post(`${API}/reminders/${internet.id}/complete`).send({ completedOn: today }).expect(409);
  });

  it('undoes done without doubling the series, and keeps the payment', async () => {
    const done = (await list('&status=done')).items[0];
    const { body } = await owner.agent.post(`${API}/reminders/${done.id}/reopen`).expect(200);
    expect(body.data).toMatchObject({ keptTransaction: true, reminder: { status: 'pending', completedOn: null } });

    const open = await list('&search=Internet');
    expect(open.items).toHaveLength(1);
    const payments = (await owner.agent.get(`${API}/transactions?month=${month}`).expect(200)).body.data;
    expect(payments.total).toBe(1);
  });

  it('just ticks off a reminder without a payment', async () => {
    const water = (await list('&search=Water')).items[0];
    const { body } = await owner.agent.post(`${API}/reminders/${water.id}/complete`).send({ completedOn: today }).expect(200);
    expect(body.data).toMatchObject({ next: null, transaction: null, reminder: { status: 'done', transactionId: null } });
  });

  it('alerts only for open reminders that are overdue or due within three days', async () => {
    const soon = await add({ title: 'Gym', dueDate: '2026-10-13', amount: 20 });
    await add({ title: 'Far away', dueDate: '2026-10-14', amount: 99 });
    const alerts = async () => (await owner.agent.get(`${API}/reminders/alerts?today=${today}`).expect(200)).body.data;

    // Internet (reopened, due on the 8th) is overdue; Gym is due on the 13th, the last day of the window.
    const before = await alerts();
    expect(before.items.map((item) => item.title)).toEqual(['Internet', 'Gym']);
    expect(before).toMatchObject({ total: 2, windowDays: 3, overdue: { count: 1, amount: 45 }, soon: { count: 1, amount: 20 } });

    await owner.agent.post(`${API}/reminders/${soon.id}/complete`).send({ completedOn: today }).expect(200);
    expect((await alerts()).items.map((item) => item.title)).toEqual(['Internet']);

    const strangers = (await stranger.agent.get(`${API}/reminders/alerts?today=${today}`).expect(200)).body.data;
    expect(strangers.items.every((item) => item.title !== 'Internet')).toBe(true);
  });

  it("rolls back when the budget is someone else's", async () => {
    const strangerReminder = (await stranger.agent.post(`${API}/reminders`).send({ title: 'Mine', dueDate: today, frequency: 'monthly' }).expect(201)).body.data;
    await stranger.agent
      .post(`${API}/reminders/${strangerReminder.id}/complete`)
      .send({ completedOn: today, payment: { amount: 10, paidTo: 'X', method: 'Card', budgetId, categoryName: 'Internet' } })
      .expect(404);
    const after = (await stranger.agent.get(`${API}/reminders?today=${today}`).expect(200)).body.data;
    expect(after.counts).toEqual({ open: 1, done: 0 });
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
