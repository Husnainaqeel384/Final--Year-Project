import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middlewares/validate.js';
import * as splits from '../services/split.service.js';
import { amount, idParam, requiredText } from '../utils/schemas.js';

// Bill splitting happens between people, so it belongs to the user, not to a workspace.
const router = Router();

router.get('/contacts', async (req, res) => {
  res.json({ success: true, data: await splits.listContacts(req.user.id) });
});

router.post('/contacts', validate({ body: z.object({ username: requiredText(30) }) }), async (req, res) => {
  await splits.addContact(req.user, req.valid.body.username);
  res.status(201).json({ success: true });
});

router.delete('/contacts/:id', validate({ params: idParam }), async (req, res) => {
  await splits.deleteContact(req.user.id, req.valid.params.id);
  res.json({ success: true });
});

router.get('/groups', async (req, res) => {
  res.json({ success: true, data: await splits.listGroups(req.user.id) });
});

router.post(
  '/groups',
  validate({ body: z.object({ name: requiredText(50), members: z.array(requiredText(30)).min(1).max(50) }) }),
  async (req, res) => {
    await splits.createGroup(req.user, req.valid.body);
    res.status(201).json({ success: true });
  },
);

router.get('/groups/:id', validate({ params: idParam }), async (req, res) => {
  res.json({ success: true, data: await splits.getGroup(req.user, req.valid.params.id) });
});

router.delete('/groups/:id', validate({ params: idParam }), async (req, res) => {
  await splits.deleteGroup(req.user.id, req.valid.params.id);
  res.json({ success: true });
});

router.post(
  '/groups/:id/bills',
  validate({ params: idParam, body: z.object({ amount, mode: z.enum(['equal', 'paid-by-me']) }) }),
  async (req, res) => {
    await splits.addBill(req.user, req.valid.params.id, req.valid.body);
    res.status(201).json({ success: true });
  },
);

router.post(
  '/groups/:id/settle',
  validate({ params: idParam, body: z.object({ amount }) }),
  async (req, res) => {
    await splits.settle(req.user, req.valid.params.id, req.valid.body.amount);
    res.json({ success: true });
  },
);

export default router;
