/**
 * Features that are built but switched off. The web app has the same switch in
 * apps/web/src/config/features.js; keep the two in step.
 */
export const FEATURES = {
  // Switched off by the owner while its use case is settled. The routes aren't mounted,
  // so nobody can reach them directly either. Set to true to bring bill splitting back.
  splitBills: false,
};
