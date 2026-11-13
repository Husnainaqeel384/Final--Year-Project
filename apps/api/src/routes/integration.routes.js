import { Router } from 'express';
import { z } from 'zod';
import { requireWorkspaceManager, resolveWorkspace } from '../middlewares/workspace.js';
import { validate } from '../middlewares/validate.js';
import { spreadsheetUpload } from '../middlewares/upload.js';
import * as integrations from '../services/integration.service.js';
import * as webhooks from '../services/webhook.service.js';
import { idParam, month, requiredText } from '../utils/schemas.js';

const router = Router();
router.use(resolveWorkspace);

const CONTENT_TYPES = {
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  csv: 'text/csv; charset=utf-8',
};

const dataset = z.enum(['transactions', 'expenses']);
const format = z.enum(['xlsx', 'csv']);

function sendFile(res, buffer, contentType, filename) {
  res.set({ 'Content-Type': contentType, 'Content-Disposition': `attachment; filename="${filename}"` });
  res.send(buffer);
}

// Budgets need a month, so they have their own route ahead of the general export.
router.get(
  '/export/budget.:format',
  validate({ params: z.object({ format }), query: z.object({ month }) }),
  async (req, res) => {
    const { format: type } = req.valid.params;
    const { month: selected } = req.valid.query;
    const buffer = await integrations.exportBudget(req.workspace, selected, type);
    sendFile(res, buffer, CONTENT_TYPES[type], `budget-${selected}.${type}`);
  },
);

router.get(
  '/export/:dataset.:format',
  validate({ params: z.object({ dataset, format }), query: z.object({ month: month.optional() }) }),
  async (req, res) => {
    const { dataset: name, format: type } = req.valid.params;
    const buffer = await integrations.exportDataset(req.workspace, name, type, req.valid.query.month);
    sendFile(res, buffer, CONTENT_TYPES[type], `${name}.${type}`);
  },
);

router.get('/templates/:dataset.xlsx', validate({ params: z.object({ dataset }) }), async (req, res) => {
  const buffer = await integrations.buildTemplate(req.valid.params.dataset);
  sendFile(res, buffer, CONTENT_TYPES.xlsx, `${req.valid.params.dataset}-template.xlsx`);
});

router.post('/import/:dataset', spreadsheetUpload, validate({ params: z.object({ dataset }) }), async (req, res) => {
  const data = await integrations.importDataset(req.workspace, req.valid.params.dataset, req.file);
  res.status(201).json({ success: true, data });
});

router.get('/reports/:month.pdf', validate({ params: z.object({ month }) }), async (req, res) => {
  const buffer = await integrations.buildReportPdf(req.workspace, req.valid.params.month);
  sendFile(res, buffer, 'application/pdf', `budget-report-${req.valid.params.month}.pdf`);
});

/* Private feed links */
router.get('/feeds', async (req, res) => {
  res.json({ success: true, data: await integrations.listFeeds(req.workspace) });
});

router.post('/feeds', validate({ body: z.object({ kind: z.enum(['calendar', 'sheets']) }) }), async (req, res) => {
  res.status(201).json({ success: true, data: await integrations.createFeed(req.workspace, req.valid.body.kind) });
});

router.delete('/feeds/:id', validate({ params: idParam }), async (req, res) => {
  await integrations.deleteFeed(req.workspace, req.valid.params.id);
  res.json({ success: true });
});

/* Webhooks */
router.get('/webhooks', async (req, res) => {
  res.json({ success: true, data: await webhooks.listWebhooks(req.workspace) });
});

router.post(
  '/webhooks',
  requireWorkspaceManager,
  validate({
    body: z.object({
      name: requiredText(60),
      provider: z.enum(['slack', 'discord', 'generic']),
      url: z.url('Enter a valid URL').max(500),
      events: z.array(z.enum(['expense.created', 'transaction.created', 'budget.threshold'])).min(1),
    }),
  }),
  async (req, res) => {
    res.status(201).json({ success: true, data: await webhooks.createWebhook(req.workspace, req.valid.body) });
  },
);

router.post('/webhooks/:id/test', requireWorkspaceManager, validate({ params: idParam }), async (req, res) => {
  res.json({ success: true, data: await webhooks.sendTestWebhook(req.workspace, req.valid.params.id) });
});

router.delete('/webhooks/:id', requireWorkspaceManager, validate({ params: idParam }), async (req, res) => {
  await webhooks.deleteWebhook(req.workspace, req.valid.params.id);
  res.json({ success: true });
});

export default router;
