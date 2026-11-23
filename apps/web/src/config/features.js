/**
 * Switches for features that are built but not shown yet. Turning one off hides
 * its pages, menu links and marketing copy; the API and stored data stay as they are.
 */
export const FEATURES = {
  // Hidden by the owner on 2026-11-13 until its use case is settled. Set to true to bring it back.
  splitBills: false,
};

/**
 * The public demo site, set at build time with VITE_DEMO_MODE=true. It shows the
 * one-click demo sign-in, which only works when the API has DEMO_MODE on too.
 */
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

/**
 * Shown on the demo site's sign-in page. Must match DEMO_PASSWORD and the first
 * account in apps/api/seeds/demo.js. It is public on purpose: demo mode locks the account.
 */
export const DEMO_ACCOUNT = { email: 'demo@budgetbook.dev', password: 'Demo@12345' };
