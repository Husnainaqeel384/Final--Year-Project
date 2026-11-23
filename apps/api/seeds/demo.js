import bcrypt from 'bcrypt';
import { db } from '../src/db/knex.js';
import { logger } from '../src/config/logger.js';
import { PERSONAL_TABLES } from '../src/utils/scope.js';

export const DEMO_PASSWORD = 'Demo@12345';

/** Fictional accounts only. Do not put real names or addresses here: this file is public. */
const DEMO_USERS = [
  { first_name: 'Alex', last_name: 'Morgan', username: 'alexmorgan', email: 'demo@budgetbook.dev', role: 'user' },
  { first_name: 'Sam', last_name: 'Rivera', username: 'samrivera', email: 'sam@budgetbook.dev', role: 'user' },
  { first_name: 'Jordan', last_name: 'Lee', username: 'jordanlee', email: 'jordan@budgetbook.dev', role: 'user' },
  { first_name: 'Admin', last_name: 'User', username: 'admin', email: 'admin@budgetbook.dev', role: 'admin' },
];

export const DEMO_EMAILS = DEMO_USERS.map((user) => user.email);
/** The account the "Try the demo" button signs in to. */
export const DEMO_LOGIN_EMAIL = DEMO_EMAILS[0];

// [category, planned, typical share of the plan that gets spent]
const PLAN = [
  ['Mortgage/Rent', 1650, 1],
  ['Groceries', 620, 0.96],
  ['Dining Out', 280, 1.14],
  ['Electricity', 140, 0.88],
  ['Internet', 70, 1],
  ['Fuel', 210, 0.84],
  ['Streaming', 45, 1],
  ['Health Insurance', 310, 1],
  ['Activities', 180, 0.72],
  ['Clothing', 150, 0.61],
];

const DESCRIPTIONS = {
  Groceries: ['Weekly shop', 'Farmers market', 'Corner store'],
  'Dining Out': ['Team lunch', 'Dinner with friends', 'Coffee and pastries'],
  Fuel: ['Fuel top-up'],
  Activities: ['Climbing gym', 'Cinema tickets'],
  Clothing: ['Running shoes', 'Winter jacket'],
};

/** Seeded so the demo looks the same on every install. */
function createRandom(seed) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

const pad = (value) => String(value).padStart(2, '0');
const toDate = (year, monthIndex, day) => `${year}-${pad(monthIndex + 1)}-${pad(day)}`;
const money = (value) => Math.round(value * 100) / 100;

function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDate(date.getFullYear(), date.getMonth(), date.getDate());
}

async function seedWorkspace(trx, { userId, organizationId, scale, seed, name, withTrip = false }) {
  const random = createRandom(seed);
  const now = new Date();
  const scope = { user_id: userId, organization_id: organizationId };
  const scopeKey = organizationId ? `o${organizationId}` : `u${userId}`;
  const expenses = [];

  for (let back = 11; back >= 0; back -= 1) {
    const first = new Date(now.getFullYear(), now.getMonth() - back, 1);
    const year = first.getFullYear();
    const monthIndex = first.getMonth();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const isCurrent = back === 0;
    const lastDay = isCurrent ? now.getDate() : daysInMonth;
    // The current month is only partly spent, so the forecast has something to project.
    const monthProgress = lastDay / daysInMonth;

    const [budgetId] = await trx('budgets').insert({
      ...scope,
      scope_key: scopeKey,
      name,
      month: toDate(year, monthIndex, 1),
      income: money((5200 + (back < 6 ? 400 : 0)) * scale),
      savings_goal: money(800 * scale),
    });

    await trx('budget_items').insert(
      PLAN.map(([category, planned]) => ({
        budget_id: budgetId,
        category_name: category,
        amount: money(planned * scale),
      })),
    );

    for (const [category, planned, usage] of PLAN) {
      const seasonal = usage === 1 ? 1 : 0.85 + random() * 0.32;
      // Dining out runs ahead of the calendar so the demo shows a category nearing its limit.
      const pace = category === 'Dining Out' ? Math.max(monthProgress, 0.75) : monthProgress;
      const target = planned * scale * usage * seasonal * (usage === 1 ? 1 : pace);
      const pieces = usage === 1 ? 1 : 3 + Math.floor(random() * 4);
      const options = DESCRIPTIONS[category] ?? [''];

      for (let index = 0; index < pieces; index += 1) {
        expenses.push({
          ...scope,
          budget_id: budgetId,
          category_name: category,
          amount: money(target / pieces),
          description: options[Math.floor(random() * options.length)],
          spent_on: toDate(year, monthIndex, usage === 1 ? 1 : 1 + Math.floor(random() * lastDay)),
        });
      }
    }
  }

  // A second budget in the current month shows how separate plans sit side by side.
  if (withTrip) {
    const month = toDate(now.getFullYear(), now.getMonth(), 1);
    const [tripId] = await trx('budgets').insert({ ...scope, scope_key: scopeKey, name: 'Lisbon weekend', month, income: 0, savings_goal: 0 });
    await trx('budget_items').insert(
      [['Flights', 420], ['Hotels', 360], ['Sightseeing', 120], ['Dining Out', 150]].map(([category, amount]) => ({ budget_id: tripId, category_name: category, amount })),
    );
    const day = (value) => toDate(now.getFullYear(), now.getMonth(), Math.min(value, now.getDate()));
    expenses.push(
      { ...scope, budget_id: tripId, category_name: 'Flights', amount: 389.4, description: 'Return flights', spent_on: day(2) },
      { ...scope, budget_id: tripId, category_name: 'Hotels', amount: 180, description: 'Hotel deposit', spent_on: day(3) },
    );
  }

  await trx.batchInsert('expenses', expenses, 200);

  const people = ['Bright Payroll Ltd', 'City Utilities', 'Harbor Rentals', 'Maple Grocers', 'Sam Rivera', 'Northside Fuel'];
  const methods = ['Bank transfer', 'Card', 'Direct debit', 'Cash'];
  const transactions = [];
  for (let index = 0; index < 42; index += 1) {
    const person = people[Math.floor(random() * people.length)];
    const received = person === 'Bright Payroll Ltd';
    transactions.push({
      ...scope,
      type: received ? 'received' : index % 11 === 0 ? 'pending' : 'sent',
      date: addDays(-index * 3),
      amount: money(((received ? 2600 : 40 + random() * 460) * scale)),
      sender: received ? person : 'Alex Morgan',
      receiver: received ? 'Alex Morgan' : person,
      method: methods[Math.floor(random() * methods.length)],
      description: '',
    });
  }
  await trx.batchInsert('transactions', transactions, 200);

  // Repeating bills remember their day of the month, as the app does when one is created.
  const bill = (title, days, amount, category, frequency = 'monthly') => ({
    ...scope,
    title,
    due_date: addDays(days),
    amount: amount === null ? null : money(amount * scale),
    category_name: category,
    frequency,
    anchor_day: frequency === 'none' ? null : Number(addDays(days).slice(8, 10)),
  });
  await trx('reminders').insert([
    bill('Internet bill', -2, 45, 'Internet'),
    bill('Electricity bill', 3, 120, 'Electricity'),
    bill('Car insurance renewal', 9, 640, 'Auto Insurance', 'yearly'),
    bill('Quarterly tax payment', 16, 900, 'Taxes', 'none'),
    bill('Review subscriptions', 24, null, null, 'none'),
    { ...bill('Rent', -6, 1400, 'Mortgage/Rent', 'none'), status: 'done', completed_on: addDays(-6) },
  ]);

  await trx('notes').insert([
    { ...scope, title: 'Dining out plan', body: 'Dining out has been over budget for two months. Try a limit of two meals a week.', pinned: true },
    { ...scope, title: 'Annual bonus', body: 'Move the annual bonus straight into the emergency fund.' },
    { ...scope, body: 'Check whether the gym membership is still worth it before it renews.' },
  ]);
}

async function insertDemoData(trx) {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  const ids = {};
  for (const user of DEMO_USERS) {
    const [id] = await trx('users').insert({ ...user, password_hash: passwordHash });
    ids[user.username] = id;
  }
  const { alexmorgan: alex, samrivera: sam, jordanlee: jordan } = ids;

  await seedWorkspace(trx, { userId: alex, organizationId: null, scale: 1, seed: 42, name: 'Household', withTrip: true });

  const [organizationId] = await trx('organizations').insert({ name: 'Brightside Studio', currency: 'USD', owner_id: alex });
  await trx('organization_members').insert([
    { organization_id: organizationId, user_id: alex, role: 'owner' },
    { organization_id: organizationId, user_id: sam, role: 'admin' },
    { organization_id: organizationId, user_id: jordan, role: 'member' },
  ]);
  await seedWorkspace(trx, { userId: alex, organizationId, scale: 6, seed: 7, name: 'Studio operations' });

  await trx('split_contacts').insert([
    { owner_id: alex, contact_user_id: sam },
    { owner_id: alex, contact_user_id: jordan },
  ]);
  const [groupId] = await trx('split_groups').insert({ name: 'Lake house trip', created_by: alex });
  await trx('split_group_members').insert([
    { group_id: groupId, user_id: alex, balance: 0 },
    { group_id: groupId, user_id: sam, balance: 142.5 },
    { group_id: groupId, user_id: jordan, balance: 87.25 },
  ]);
  await trx('split_activity').insert([
    { group_id: groupId, description: 'alexmorgan added a bill of 285.00, paid by them and split between 2 people (142.50 each)' },
    { group_id: groupId, description: 'jordanlee paid 55.25 of their share' },
  ]);
}

/** Safe to run repeatedly: it does nothing once the demo account exists. */
export async function seedDemoData() {
  const existing = await db('users').where({ email: DEMO_EMAILS[0] }).first('id');
  if (existing) return;

  await db.transaction(insertDemoData);
  logger.info('Demo data added');
}

/**
 * Puts the demo accounts back to a fresh copy, with dates moved up to today.
 * Only rows that belong to the demo accounts are removed; anyone who signed up
 * on the demo site keeps their data. Delete and re-insert share one transaction,
 * so a visitor never sees the demo half-built.
 */
export async function resetDemoData() {
  await db.transaction(async (trx) => {
    const userIds = (await trx('users').whereIn('email', DEMO_EMAILS).select('id')).map((row) => row.id);

    if (userIds.length) {
      // Their team rows go with the organization; personal rows would only lose
      // their owner (user_id is SET NULL), so they are removed explicitly.
      await trx('organizations').whereIn('owner_id', userIds).delete();
      for (const table of PERSONAL_TABLES) {
        await trx(table).whereIn('user_id', userIds).whereNull('organization_id').delete();
      }
      await trx('users').whereIn('id', userIds).delete();
    }

    await insertDemoData(trx);
  });
  logger.info('Demo data reset');
}
