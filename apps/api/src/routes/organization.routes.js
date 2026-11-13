import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middlewares/validate.js';
import { listOrganizationsFor } from '../services/auth.service.js';
import * as organizations from '../services/organization.service.js';
import { currency, email, idParam, requiredText } from '../utils/schemas.js';

const router = Router();

const details = z.object({ name: requiredText(80), currency });
const assignableRole = z.enum(['admin', 'member']);
const memberParams = idParam.extend({ userId: z.coerce.number().int().positive() });
const invitationParams = idParam.extend({ invitationId: z.coerce.number().int().positive() });

router.get('/', async (req, res) => {
  res.json({ success: true, data: await listOrganizationsFor(req.user.id) });
});

router.post('/', validate({ body: details }), async (req, res) => {
  res.status(201).json({ success: true, data: await organizations.createOrganization(req.user, req.valid.body) });
});

router.post(
  '/invitations/accept',
  validate({ body: z.object({ token: z.string().length(64) }) }),
  async (req, res) => {
    res.json({ success: true, data: await organizations.acceptInvitation(req.user, req.valid.body.token) });
  },
);

router.get('/:id', validate({ params: idParam }), async (req, res) => {
  res.json({ success: true, data: await organizations.getOrganization(req.user, req.valid.params.id) });
});

router.patch('/:id', validate({ params: idParam, body: details }), async (req, res) => {
  await organizations.updateOrganization(req.user, req.valid.params.id, req.valid.body);
  res.json({ success: true });
});

router.delete('/:id', validate({ params: idParam }), async (req, res) => {
  await organizations.deleteOrganization(req.user, req.valid.params.id);
  res.json({ success: true });
});

router.post(
  '/:id/invitations',
  validate({ params: idParam, body: z.object({ email, role: assignableRole }) }),
  async (req, res) => {
    const data = await organizations.inviteMember(req.user, req.valid.params.id, req.valid.body);
    res.status(201).json({ success: true, data });
  },
);

router.delete('/:id/invitations/:invitationId', validate({ params: invitationParams }), async (req, res) => {
  await organizations.revokeInvitation(req.user, req.valid.params.id, req.valid.params.invitationId);
  res.json({ success: true });
});

router.patch(
  '/:id/members/:userId',
  validate({ params: memberParams, body: z.object({ role: assignableRole }) }),
  async (req, res) => {
    const { id, userId } = req.valid.params;
    await organizations.updateMemberRole(req.user, id, userId, req.valid.body.role);
    res.json({ success: true });
  },
);

router.delete('/:id/members/:userId', validate({ params: memberParams }), async (req, res) => {
  const { id, userId } = req.valid.params;
  await organizations.removeMember(req.user, id, userId);
  res.json({ success: true });
});

export default router;
