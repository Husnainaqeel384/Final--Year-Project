import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/knex.js';
import { resolveWorkspace } from '../middlewares/workspace.js';
import { validate } from '../middlewares/validate.js';
import { notFound } from '../utils/errors.js';
import { applyScope, scopeColumns } from '../utils/scope.js';
import { dateOnly, idParam, requiredText } from '../utils/schemas.js';

const router = Router();
router.use(resolveWorkspace);

const presentReminder = (row) => ({ id: row.id, title: row.title, dueDate: row.due_date, status: row.status });
const presentNote = (row) => ({ id: row.id, body: row.body, updatedAt: row.updated_at });

/* Reminders */
router.get('/reminders', async (req, res) => {
  const rows = await applyScope(db('reminders'), req.workspace).orderByRaw("status = 'done'").orderBy('due_date');
  res.json({ success: true, data: rows.map(presentReminder) });
});

router.post(
  '/reminders',
  validate({ body: z.object({ title: requiredText(255), dueDate: dateOnly }) }),
  async (req, res) => {
    const { title, dueDate } = req.valid.body;
    const [id] = await db('reminders').insert({ ...scopeColumns(req.workspace), title, due_date: dueDate });
    res.status(201).json({ success: true, data: presentReminder(await db('reminders').where({ id }).first()) });
  },
);

router.patch(
  '/reminders/:id',
  validate({
    params: idParam,
    body: z.object({
      title: requiredText(255).optional(),
      dueDate: dateOnly.optional(),
      status: z.enum(['pending', 'done']).optional(),
    }),
  }),
  async (req, res) => {
    const { title, dueDate, status } = req.valid.body;
    const scoped = () => applyScope(db('reminders').where({ id: req.valid.params.id }), req.workspace);
    if (!(await scoped().first('id'))) throw notFound('Reminder');

    // Spread conditionally: knex rejects undefined values in an update.
    await scoped().update({
      ...(title !== undefined && { title }),
      ...(dueDate !== undefined && { due_date: dueDate }),
      ...(status !== undefined && { status }),
      updated_at: db.fn.now(),
    });
    res.json({ success: true, data: presentReminder(await scoped().first()) });
  },
);

router.delete('/reminders/:id', validate({ params: idParam }), async (req, res) => {
  const removed = await applyScope(db('reminders').where({ id: req.valid.params.id }), req.workspace).delete();
  if (!removed) throw notFound('Reminder');
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
