import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { env } from '../config/env.js';
import { blockDemoAccount } from '../middlewares/demo.js';
import { receiptUpload } from '../middlewares/upload.js';
import { validate } from '../middlewares/validate.js';
import { resolveWorkspace } from '../middlewares/workspace.js';
import { month } from '../utils/schemas.js';
import { generateInsights, getSavedInsights } from './insights.js';
import { PROVIDER_IDS } from './providers/index.js';
import { scanReceipt } from './receipt.js';
import { metered, setLimits, usageSummary } from './usage.js';
import * as settings from './settings.js';

const router = Router();

// Each call spends the person's own credit, so a runaway loop or double-click storm is capped.
const aiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: (req) => `user-${req.user.id}`,
  message: { success: false, message: 'Too many AI requests. Please wait a few minutes.' },
  skip: () => env.NODE_ENV === 'test',
});

const provider = z.enum(PROVIDER_IDS, 'Choose a provider');
// Keys are opaque strings that differ by provider; only their size is checked.
const apiKey = z.string().trim().min(10, 'That API key looks too short').max(300);
const model = z.string().regex(settings.MODEL_PATTERN, 'Choose a model');

router.get('/settings', async (req, res) => {
  res.json({
    success: true,
    data: { providers: settings.listProviders(), saved: await settings.getSettings(req.user.id) },
  });
});

router.post(
  '/models',
  aiLimiter,
  validate({ body: z.object({ provider, apiKey: apiKey.optional() }) }),
  async (req, res) => {
    res.json({ success: true, data: await settings.listModelsFor(req.user, req.valid.body) });
  },
);

router.put(
  '/settings',
  // The demo account is shared, so a key saved there would be used by every visitor.
  blockDemoAccount,
  aiLimiter,
  validate({ body: z.object({ provider, model, apiKey: apiKey.optional() }) }),
  async (req, res) => {
    res.json({ success: true, data: await settings.saveSettings(req.user, req.valid.body) });
  },
);

router.delete('/settings', blockDemoAccount, async (req, res) => {
  await settings.deleteSettings(req.user.id);
  res.json({ success: true });
});

router.get('/usage', async (req, res) => {
  res.json({ success: true, data: await usageSummary(req.user.id) });
});

// Empty means no limit. The demo account is shared, so its limits can't be changed.
const limit = (max) => z.number().int().min(1, 'A limit must be at least 1').max(max).nullable();
router.put('/limits', blockDemoAccount, validate({ body: z.object({ daily: limit(1000), weekly: limit(10000) }) }), async (req, res) => {
  res.json({ success: true, data: await setLimits(req.user.id, req.valid.body) });
});

router.post('/receipts/scan', aiLimiter, resolveWorkspace, receiptUpload, async (req, res) => {
  const credentials = metered(await settings.resolveCredentials(req), req, 'receipt');
  res.json({ success: true, data: await scanReceipt(credentials, req.workspace, req.file) });
});

router.get('/insights', resolveWorkspace, validate({ query: z.object({ month }) }), async (req, res) => {
  res.json({ success: true, data: await getSavedInsights(req.workspace, req.valid.query.month) });
});

router.post('/insights', aiLimiter, resolveWorkspace, validate({ body: z.object({ month }) }), async (req, res) => {
  const credentials = metered(await settings.resolveCredentials(req), req, 'insights');
  res.json({ success: true, data: await generateInsights(credentials, req.workspace, req.valid.body.month) });
});

export default router;
