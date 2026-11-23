import { Router } from 'express';
import { z } from 'zod';
import { resolveWorkspace, requireWorkspaceManager } from '../middlewares/workspace.js';
import { validate } from '../middlewares/validate.js';
import * as budgets from '../services/budget.service.js';
import * as expenses from '../services/expense.service.js';
import * as transactions from '../services/transaction.service.js';
import { getDashboard } from '../services/dashboard.service.js';
import { getReport, listReportMonths } from '../services/report.service.js';
import { currentMonth } from '../utils/months.js';
import { amount, dateOnly, idParam, month, nonNegativeAmount, optional, requiredText } from '../utils/schemas.js';

const router = Router();
router.use(resolveWorkspace);

router.get('/dashboard', validate({ query: z.object({ month: month.optional() }) }), async (req, res) => {
  const data = await getDashboard(req.workspace, req.valid.query.month ?? currentMonth());
  res.json({ success: true, data });
});

/* Budgets */
const budgetValues = { name: requiredText(80), income: nonNegativeAmount, savingsGoal: nonNegativeAmount };
const itemParams = idParam.extend({ itemId: z.coerce.number().int().positive() });

router.get(
  '/budgets',
  validate({ query: z.object({ month: month.optional(), year: z.coerce.number().int().min(2000).max(2100).optional() }) }),
  async (req, res) => {
    res.json({ success: true, data: await budgets.listBudgets(req.workspace, req.valid.query) });
  },
);

// Registered before /budgets/:id so "years" is not read as an id.
router.get('/budgets/years', async (req, res) => {
  res.json({ success: true, data: await budgets.listBudgetYears(req.workspace) });
});

router.post(
  '/budgets',
  requireWorkspaceManager,
  validate({
    body: z.object({ month, ...budgetValues, copyFromId: z.number().int().positive().optional() }),
  }),
  async (req, res) => {
    res.status(201).json({ success: true, data: await budgets.createBudget(req.workspace, req.valid.body) });
  },
);

router.get('/budgets/:id', validate({ params: idParam }), async (req, res) => {
  res.json({ success: true, data: await budgets.getBudget(req.workspace, req.valid.params.id) });
});

router.patch(
  '/budgets/:id',
  requireWorkspaceManager,
  validate({ params: idParam, body: z.object(budgetValues) }),
  async (req, res) => {
    res.json({ success: true, data: await budgets.updateBudget(req.workspace, req.valid.params.id, req.valid.body) });
  },
);

router.delete('/budgets/:id', requireWorkspaceManager, validate({ params: idParam }), async (req, res) => {
  await budgets.deleteBudget(req.workspace, req.valid.params.id);
  res.json({ success: true });
});

router.post(
  '/budgets/:id/items',
  requireWorkspaceManager,
  validate({
    params: idParam,
    body: z.object({
      items: z.array(z.object({ categoryName: requiredText(100), amount })).min(1).max(100),
    }),
  }),
  async (req, res) => {
    const data = await budgets.addItems(req.workspace, req.valid.params.id, req.valid.body.items);
    res.status(201).json({ success: true, data });
  },
);

router.patch(
  '/budgets/:id/items/:itemId',
  requireWorkspaceManager,
  validate({ params: itemParams, body: z.object({ amount }) }),
  async (req, res) => {
    const { id, itemId } = req.valid.params;
    res.json({ success: true, data: await budgets.updateItem(req.workspace, id, itemId, req.valid.body.amount) });
  },
);

router.delete(
  '/budgets/:id/items/:itemId',
  requireWorkspaceManager,
  validate({ params: itemParams }),
  async (req, res) => {
    await budgets.deleteItem(req.workspace, req.valid.params.id, req.valid.params.itemId);
    res.json({ success: true });
  },
);

/* Expenses */
const expenseBody = z.object({
  categoryName: requiredText(100),
  amount,
  description: z.string().trim().max(255).default(''),
  spentOn: dateOnly,
  // null leaves the expense unassigned; leaving it out picks the month's only budget, if there is one.
  budgetId: z.number().int().positive().nullable().optional(),
});

const expenseQuery = z.object({
  month: optional(month),
  budget: optional(z.union([z.literal('none'), z.coerce.number().int().positive()])),
  search: optional(z.string().trim().max(100)),
  day: optional(dateOnly),
  category: optional(z.string().trim().max(100)),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

function splitExpenseQuery({ page, limit, ...filters }) {
  return [{ ...filters, month: filters.month ?? currentMonth() }, { page, limit }];
}

router.get('/expenses/summary', validate({ query: expenseQuery }), async (req, res) => {
  const data = await expenses.summarizeExpenses(req.workspace, ...splitExpenseQuery(req.valid.query));
  res.json({ success: true, data });
});

router.get('/expenses', validate({ query: expenseQuery }), async (req, res) => {
  const data = await expenses.listExpenses(req.workspace, ...splitExpenseQuery(req.valid.query));
  res.json({ success: true, data });
});

router.post('/expenses', validate({ body: expenseBody }), async (req, res) => {
  res.status(201).json({ success: true, data: await expenses.createExpense(req.workspace, req.valid.body) });
});

// One receipt split by category: up to 20 expenses that share a date and budget, saved together.
const expenseBatch = z.object({
  spentOn: dateOnly,
  budgetId: z.number().int().positive().nullable().optional(),
  items: z
    .array(z.object({ categoryName: requiredText(100), amount, description: z.string().trim().max(255).default('') }))
    .min(1, 'Add at least one expense')
    .max(20, 'A receipt can be split into at most 20 expenses'),
});

router.post('/expenses/batch', validate({ body: expenseBatch }), async (req, res) => {
  res.status(201).json({ success: true, data: await expenses.createExpenses(req.workspace, req.valid.body) });
});

router.patch('/expenses/:id', validate({ params: idParam, body: expenseBody }), async (req, res) => {
  res.json({ success: true, data: await expenses.updateExpense(req.workspace, req.valid.params.id, req.valid.body) });
});

router.delete('/expenses/:id', validate({ params: idParam }), async (req, res) => {
  await expenses.deleteExpense(req.workspace, req.valid.params.id);
  res.json({ success: true });
});

/* Transactions */
const transactionBody = z.object({
  type: z.enum(['sent', 'received', 'pending']),
  date: dateOnly,
  amount,
  sender: requiredText(100),
  receiver: requiredText(100),
  method: requiredText(60),
  description: z.string().trim().max(255).default(''),
  // Optional budget link: "sent" with a category becomes an expense, "received" counts as income.
  budgetId: z.number().int().positive().nullable().optional(),
  categoryName: z.string().trim().max(100).nullable().optional(),
});

const transactionQuery = z.object({
  month: optional(month),
  search: optional(z.string().trim().max(100)),
  type: optional(z.enum(['sent', 'received', 'pending'])),
  budget: optional(z.union([z.literal('none'), z.coerce.number().int().positive()])),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

router.get('/transactions', validate({ query: transactionQuery }), async (req, res) => {
  res.json({ success: true, data: await transactions.listTransactions(req.workspace, req.valid.query) });
});

router.post('/transactions', validate({ body: transactionBody }), async (req, res) => {
  res.status(201).json({ success: true, data: await transactions.createTransaction(req.workspace, req.valid.body) });
});

router.patch('/transactions/:id', validate({ params: idParam, body: transactionBody }), async (req, res) => {
  res.json({ success: true, data: await transactions.updateTransaction(req.workspace, req.valid.params.id, req.valid.body) });
});

router.delete('/transactions/:id', validate({ params: idParam }), async (req, res) => {
  await transactions.deleteTransaction(req.workspace, req.valid.params.id);
  res.json({ success: true });
});

/* Reports */
router.get('/reports/months', async (req, res) => {
  res.json({ success: true, data: await listReportMonths(req.workspace) });
});

router.get('/reports/:month', validate({ params: z.object({ month }) }), async (req, res) => {
  res.json({ success: true, data: await getReport(req.workspace, req.valid.params.month) });
});

export default router;
