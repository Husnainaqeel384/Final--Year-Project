import { randomBytes } from 'node:crypto';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import app from '../src/app.js';
import { migrate } from '../src/db/bootstrap.js';
import { db } from '../src/db/knex.js';

const API = '/api/v1';
const PASSWORD = 'Correct-horse-1';
const month = '2026-04';

async function createAccount() {
  const suffix = randomBytes(5).toString('hex');
  const email = `batch_${suffix}@example.com`;
  const agent = request.agent(app);
  await agent.post(`${API}/auth/register`).send({ firstName: 'Batch', lastName: 'Saver', username: `batch_${suffix}`, email, password: PASSWORD }).expect(201);
  const { body } = await agent.post(`${API}/auth/login`).send({ email, password: PASSWORD }).expect(200);
  return { agent, id: body.data.user.id };
}

const count = (userId) => db('expenses').where({ user_id: userId }).count({ n: '*' }).first().then((row) => Number(row.n));

beforeAll(async () => {
  await migrate();
});

afterAll(() => db.destroy());

describe('saving a receipt split by category', () => {
  let owner;
  let stranger;
  let budgetId;
  let strangerBudgetId;
  const split = {
    spentOn: `${month}-12`,
    items: [
      { categoryName: 'Groceries', amount: 38.2, description: 'Maple Grocers: Milk +4 more' },
      { categoryName: 'Personal Supplies', amount: 9.8, description: 'Maple Grocers: Dish soap' },
    ],
  };

  beforeAll(async () => {
    owner = await createAccount();
    stranger = await createAccount();
    budgetId = (await owner.agent.post(`${API}/budgets`).send({ name: 'Household', month, income: 2000, savingsGoal: 0 }).expect(201)).body.data.id;
    strangerBudgetId = (await stranger.agent.post(`${API}/budgets`).send({ name: 'Theirs', month, income: 100, savingsGoal: 0 }).expect(201)).body.data.id;
  });

  it('saves one expense per category, in the same budget and on the same date', async () => {
    const { body } = await owner.agent.post(`${API}/expenses/batch`).send({ ...split, budgetId }).expect(201);
    expect(body.data.map((expense) => [expense.categoryName, expense.amount, expense.budgetId, expense.spentOn])).toEqual([
      ['Groceries', 38.2, budgetId, `${month}-12`],
      ['Personal Supplies', 9.8, budgetId, `${month}-12`],
    ]);
  });

  it('saves nothing when one part is invalid', async () => {
    const before = await count(owner.id);
    await owner.agent
      .post(`${API}/expenses/batch`)
      .send({ ...split, items: [...split.items, { categoryName: 'Fuel', amount: 0 }] })
      .expect(400);
    // A budget from another month is refused before anything is written.
    await owner.agent.post(`${API}/expenses/batch`).send({ ...split, spentOn: '2026-05-02', budgetId }).expect(400);
    expect(await count(owner.id)).toBe(before);
  });

  it("can't put expenses into another account's budget", async () => {
    const before = await count(owner.id);
    await owner.agent.post(`${API}/expenses/batch`).send({ ...split, budgetId: strangerBudgetId }).expect(404);
    expect(await count(owner.id)).toBe(before);
    const theirs = await stranger.agent.get(`${API}/expenses`).query({ month }).expect(200);
    expect(theirs.body.data.total ?? theirs.body.data.items?.length ?? 0).toBe(0);
  });

  it('limits a split to between 1 and 20 expenses', async () => {
    await owner.agent.post(`${API}/expenses/batch`).send({ ...split, items: [] }).expect(400);
    const many = Array.from({ length: 21 }, (_, index) => ({ categoryName: 'Groceries', amount: 1, description: `Item ${index}` }));
    await owner.agent.post(`${API}/expenses/batch`).send({ ...split, items: many }).expect(400);
  });
});
