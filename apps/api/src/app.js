import express from 'express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { z } from 'zod';
import { env } from './config/env.js';
import { FEATURES } from './config/features.js';
import { logger } from './config/logger.js';
import { db } from './db/knex.js';
import aiRoutes from './ai/ai.routes.js';
import { requireAuth } from './middlewares/auth.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { apiLimiter, feedLimiter } from './middlewares/rateLimit.js';
import { validate } from './middlewares/validate.js';
import adminRoutes from './routes/admin.routes.js';
import authRoutes from './routes/auth.routes.js';
import categoryRoutes from './routes/category.routes.js';
import financeRoutes from './routes/finance.routes.js';
import integrationRoutes from './routes/integration.routes.js';
import organizationRoutes from './routes/organization.routes.js';
import planningRoutes from './routes/planning.routes.js';
import splitRoutes from './routes/split.routes.js';
import { UPLOADS_DIR } from './services/auth.service.js';
import { readCalendarFeed, readTransactionsFeed } from './services/integration.service.js';

const app = express();

app.disable('x-powered-by');
// Trusts only a proxy on the private network (nginx in Docker), so clients can't fake their IP.
app.set('trust proxy', 'loopback, linklocal, uniquelocal');

app.get('/health', async (_req, res) => {
  await db.raw('SELECT 1');
  res.json({ status: 'ok' });
});

app.use(
  pinoHttp({
    logger,
    autoLogging: { ignore: (req) => req.url === '/health' },
    // One short line per request. Full headers made real problems hard to spot and added nothing.
    serializers: {
      req: (req) => ({ id: req.id, method: req.method, url: req.url }),
      res: (res) => ({ statusCode: res.statusCode }),
    },
  }),
);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'same-site' } }));
app.use(cors({ origin: env.APP_URL, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

// Served without directory listing; helmet's nosniff stops any file being treated as HTML.
app.use('/uploads', express.static(UPLOADS_DIR, { index: false, maxAge: '30d' }));

/* Public feeds: the secret token in the URL takes the place of a session. */
const feedToken = validate({ params: z.object({ token: z.string().length(64) }) });

app.get('/feeds/:token/reminders.ics', feedLimiter, feedToken, async (req, res) => {
  res.type('text/calendar; charset=utf-8').send(await readCalendarFeed(req.valid.params.token));
});

app.get('/feeds/:token/transactions.csv', feedLimiter, feedToken, async (req, res) => {
  res.type('text/csv; charset=utf-8').send(await readTransactionsFeed(req.valid.params.token));
});

const api = express.Router();
api.use(apiLimiter);
api.use('/auth', authRoutes);
api.use('/categories', requireAuth, categoryRoutes);
api.use('/organizations', requireAuth, organizationRoutes);
if (FEATURES.splitBills) api.use('/splits', requireAuth, splitRoutes);
api.use('/admin', requireAuth, adminRoutes);
api.use('/integrations', requireAuth, integrationRoutes);
api.use('/ai', requireAuth, aiRoutes);
api.use('/', requireAuth, financeRoutes);
api.use('/', requireAuth, planningRoutes);
app.use('/api/v1', api);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
