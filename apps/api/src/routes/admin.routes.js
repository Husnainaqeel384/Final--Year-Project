import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import * as admin from '../services/admin.service.js';
import { idParam } from '../utils/schemas.js';

const router = Router();
router.use(requireAdmin);

router.get('/users', async (_req, res) => {
  res.json({ success: true, data: await admin.listUsers() });
});

router.patch(
  '/users/:id',
  validate({ params: idParam, body: z.object({ role: z.enum(['user', 'admin']) }) }),
  async (req, res) => {
    await admin.updateUserRole(req.user, req.valid.params.id, req.valid.body.role);
    res.json({ success: true });
  },
);

router.delete('/users/:id', validate({ params: idParam }), async (req, res) => {
  await admin.deleteUser(req.user, req.valid.params.id);
  res.json({ success: true });
});

export default router;
