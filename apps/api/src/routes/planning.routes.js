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

const presentNote = (row) => ({
  id: row.id,
  title: row.title ?? '',
  body: row.body,
  pinned: Boolean(row.pinned),
  updatedAt: row.updated_at,
});

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
const noteFields = {
  title: z.string().trim().max(120, 'Keep the title under 120 characters'),
  body: requiredText(2000),
  pinned: z.boolean(),
};
const noteBody = z.object({ ...noteFields, title: noteFields.title.optional(), pinned: noteFields.pinned.optional() });

router.get('/notes', validate({ query: z.object({ search: optional(z.string().trim().max(100)) }) }), async (req, res) => {
  const query = applyScope(db('notes'), req.workspace);
  if (req.valid.query.search) {
    const term = `%${req.valid.query.search}%`;
    query.where((inner) => inner.where('title', 'like', term).orWhere('body', 'like', term));
  }
  // Pinned notes first, then the most recently edited.
  const rows = await query.orderBy([{ column: 'pinned', order: 'desc' }, { column: 'updated_at', order: 'desc' }, { column: 'id', order: 'desc' }]);
  res.json({ success: true, data: rows.map(presentNote) });
});

router.post('/notes', validate({ body: noteBody }), async (req, res) => {
  const { title, body, pinned } = req.valid.body;
  const [id] = await db('notes').insert({ ...scopeColumns(req.workspace), title: title || null, body, pinned: pinned ?? false });
  res.status(201).json({ success: true, data: presentNote(await db('notes').where({ id }).first()) });
});

// Any subset of fields. Pinning alone leaves the "edited" date as it was, since the note itself didn't change.
router.patch('/notes/:id', validate({ params: idParam, body: z.object(noteFields).partial() }), async (req, res) => {
  const scoped = () => applyScope(db('notes').where({ id: req.valid.params.id }), req.workspace);
  if (!(await scoped().first('id'))) throw notFound('Note');
  const { title, body, pinned } = req.valid.body;
  const changes = {};
  if (title !== undefined) changes.title = title || null;
  if (body !== undefined) changes.body = body;
  if (title !== undefined || body !== undefined) changes.updated_at = db.fn.now();
  if (pinned !== undefined) changes.pinned = pinned;
  if (Object.keys(changes).length > 0) await scoped().update(changes);
  res.json({ success: true, data: presentNote(await scoped().first()) });
});

router.delete('/notes/:id', validate({ params: idParam }), async (req, res) => {
  const removed = await applyScope(db('notes').where({ id: req.valid.params.id }), req.workspace).delete();
  if (!removed) throw notFound('Note');
  res.json({ success: true });
});

export default router;
