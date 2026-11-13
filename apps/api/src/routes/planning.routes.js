import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/knex.js';
import { resolveWorkspace } from '../middlewares/workspace.js';
import { validate } from '../middlewares/validate.js';
import { notFound } from '../utils/errors.js';
import { applyScope, scopeColumns } from '../utils/scope.js';
import * as reminders from '../services/reminder.service.js';
import { amount, dateOnly, idParam, optional, requiredText } from '../utils/schemas.js';

const router = Router();
router.use(resolveWorkspace);

const presentNote = (row) => ({ id: row.id, body: row.body, updatedAt: row.updated_at });

/* Reminders */
const localToday = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const reminderFields = {
  title: requiredText(255),
  dueDate: dateOnly,
  // Optional: a reminder can be a plain date ("renew passport") or a bill with an amount.
  amount: amount.nullable().optional(),
  categoryName: z.string().trim().max(100).nullable().optional(),
  frequency: z.enum(['none', 'weekly', 'monthly', 'yearly']).optional(),
  note: z.string().trim().max(255).optional(),
};

const reminderQuery = z.object({
  status: z.enum(['open', 'done']).default('open'),
  search: optional(z.string().trim().max(100)),
  today: optional(dateOnly),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

const completeBody = z.object({
  completedOn: dateOnly,
  // Left out when the reminder is just ticked off; given when the bill was paid and should be recorded.
  payment: z
    .object({
      amount,
      paidTo: requiredText(100),
      method: requiredText(60),
      budgetId: z.number().int().positive().nullable().optional(),
      categoryName: z.string().trim().max(100).nullable().optional(),
    })
    .optional(),
});

router.get('/reminders', validate({ query: reminderQuery }), async (req, res) => {
  const query = { ...req.valid.query, today: req.valid.query.today ?? localToday() };
  res.json({ success: true, data: await reminders.listReminders(req.workspace, query) });
});

router.get('/reminders/alerts', validate({ query: z.object({ today: optional(dateOnly) }) }), async (req, res) => {
  const data = await reminders.listAlerts(req.workspace, { today: req.valid.query.today ?? localToday() });
  res.json({ success: true, data });
});

router.post('/reminders', validate({ body: z.object(reminderFields) }), async (req, res) => {
  res.status(201).json({ success: true, data: await reminders.createReminder(req.workspace, req.valid.body) });
});

router.patch(
  '/reminders/:id',
  validate({ params: idParam, body: z.object(reminderFields).partial() }),
  async (req, res) => {
    res.json({ success: true, data: await reminders.updateReminder(req.workspace, req.valid.params.id, req.valid.body) });
  },
);

router.post('/reminders/:id/complete', validate({ params: idParam, body: completeBody }), async (req, res) => {
  const payer = `${req.user.first_name} ${req.user.last_name}`.trim();
  const data = await reminders.completeReminder(req.workspace, req.valid.params.id, { ...req.valid.body, payer });
  res.json({ success: true, data });
});

router.post('/reminders/:id/reopen', validate({ params: idParam }), async (req, res) => {
  res.json({ success: true, data: await reminders.reopenReminder(req.workspace, req.valid.params.id) });
});

router.delete('/reminders/:id', validate({ params: idParam }), async (req, res) => {
  await reminders.deleteReminder(req.workspace, req.valid.params.id);
  res.json({ success: true });
});

/* Notes */
const noteBody = z.object({ body: requiredText(2000) });

router.get('/notes', async (req, res) => {
  const rows = await applyScope(db('notes'), req.workspace).orderBy('updated_at', 'desc');
  res.json({ success: true, data: rows.map(presentNote) });
});

router.post('/notes', validate({ body: noteBody }), async (req, res) => {
  const [id] = await db('notes').insert({ ...scopeColumns(req.workspace), body: req.valid.body.body });
  res.status(201).json({ success: true, data: presentNote(await db('notes').where({ id }).first()) });
});

router.patch('/notes/:id', validate({ params: idParam, body: noteBody }), async (req, res) => {
  const scoped = () => applyScope(db('notes').where({ id: req.valid.params.id }), req.workspace);
  if (!(await scoped().first('id'))) throw notFound('Note');
  await scoped().update({ body: req.valid.body.body, updated_at: db.fn.now() });
  res.json({ success: true, data: presentNote(await scoped().first()) });
});

router.delete('/notes/:id', validate({ params: idParam }), async (req, res) => {
  const removed = await applyScope(db('notes').where({ id: req.valid.params.id }), req.workspace).delete();
  if (!removed) throw notFound('Note');
  res.json({ success: true });
});

export default router;
