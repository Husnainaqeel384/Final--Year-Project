import { Router } from 'express';
import { z } from 'zod';
import { env, isProduction } from '../config/env.js';
import { requireAuth, SESSION_COOKIE } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { avatarUpload } from '../middlewares/upload.js';
import { authLimiter } from '../middlewares/rateLimit.js';
import * as auth from '../services/auth.service.js';
import { currency, email, password, requiredText } from '../utils/schemas.js';

const router = Router();

const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

function setSessionCookie(res, user) {
  res.cookie(SESSION_COOKIE, auth.signSession(user), {
    httpOnly: true,
    // Lax means the browser won't attach the session to cross-site POSTs, which blocks CSRF.
    sameSite: 'lax',
    secure: env.COOKIE_SECURE || (isProduction && env.APP_URL.startsWith('https')),
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
}

const username = z
  .string()
  .trim()
  .min(3, 'Username must be at least 3 characters')
  .max(30)
  .regex(/^[A-Za-z0-9_.]+$/, 'Usernames may only contain letters, numbers, dots and underscores');

const profile = {
  firstName: requiredText(50),
  lastName: requiredText(50),
  username,
  email,
};

router.post(
  '/register',
  authLimiter,
  validate({ body: z.object({ ...profile, password }) }),
  async (req, res) => {
    await auth.registerUser(req.valid.body);
    res.status(201).json({ success: true, message: 'Account created. Please sign in.' });
  },
);

router.post(
  '/login',
  authLimiter,
  validate({ body: z.object({ email, password: z.string().min(1, 'Enter your password') }) }),
  async (req, res) => {
    const user = await auth.authenticate(req.valid.body);
    setSessionCookie(res, user);
    res.json({
      success: true,
      data: { user: auth.presentUser(user), organizations: await auth.listOrganizationsFor(user.id) },
    });
  },
);

router.post('/logout', (_req, res) => {
  res.clearCookie(SESSION_COOKIE, { path: '/' });
  res.json({ success: true });
});

router.post('/forgot-password', authLimiter, validate({ body: z.object({ email }) }), async (req, res) => {
  await auth.requestPasswordReset(req.valid.body.email);
  res.json({ success: true, message: 'If that account exists, a reset link is on its way.' });
});

router.post(
  '/reset-password',
  authLimiter,
  validate({ body: z.object({ token: z.string().length(64), password }) }),
  async (req, res) => {
    await auth.resetPassword(req.valid.body);
    res.json({ success: true, message: 'Password updated. Please sign in.' });
  },
);

router.get('/me', requireAuth, async (req, res) => {
  res.json({
    success: true,
    data: { user: auth.presentUser(req.user), organizations: await auth.listOrganizationsFor(req.user.id) },
  });
});

router.patch(
  '/me',
  requireAuth,
  validate({ body: z.object({ ...profile, currency }) }),
  async (req, res) => {
    const user = await auth.updateProfile(req.user, req.valid.body);
    res.json({ success: true, data: auth.presentUser(user) });
  },
);

// Separate from PATCH /me so a quick setting change doesn't need the whole profile.
router.patch('/me/preferences', requireAuth, validate({ body: z.object({ currency }) }), async (req, res) => {
  const user = await auth.updatePreferences(req.user, req.valid.body);
  res.json({ success: true, data: auth.presentUser(user) });
});

router.post('/me/avatar', requireAuth, avatarUpload, async (req, res) => {
  const user = await auth.saveAvatar(req.user, req.file);
  res.json({ success: true, data: auth.presentUser(user) });
});

router.post(
  '/me/password',
  requireAuth,
  authLimiter,
  validate({ body: z.object({ currentPassword: z.string().min(1), newPassword: password }) }),
  async (req, res) => {
    const user = await auth.changePassword(req.user, req.valid.body);
    // Other devices are signed out by the version bump; this one gets a fresh session.
    setSessionCookie(res, user);
    res.json({ success: true, message: 'Password changed.' });
  },
);

export default router;
