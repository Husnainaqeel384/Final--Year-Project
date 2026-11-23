import { client } from './client';
import { aiSessionHeaders } from '../lib/aiSession';

// Only a demo visitor has session headers; for everyone else this adds nothing.
const withSession = () => ({ headers: aiSessionHeaders() });

export async function fetchAiSettings() {
  const res = await client.get('/ai/settings');
  return res.data.data;
}

/** Checks a key (free) and returns the models it can use. Without a key, the saved one is used. */
export async function listAiModels({ provider, apiKey }) {
  const res = await client.post('/ai/models', { provider, apiKey: apiKey || undefined });
  return res.data.data;
}

export async function saveAiSettings({ provider, model, apiKey }) {
  const res = await client.put('/ai/settings', { provider, model, apiKey: apiKey || undefined });
  return res.data.data;
}

export async function deleteAiSettings() {
  await client.delete('/ai/settings');
}

export async function fetchAiUsage() {
  const res = await client.get('/ai/usage');
  return res.data.data;
}

/** `daily` and `weekly` are request counts, or null for no limit. */
export async function saveAiLimits(limits) {
  const res = await client.put('/ai/limits', limits);
  return res.data.data;
}

export async function scanReceipt(file) {
  const form = new FormData();
  form.append('file', file);
  const res = await client.post('/ai/receipts/scan', form, withSession());
  return res.data.data;
}

export async function fetchInsights(month) {
  const res = await client.get('/ai/insights', { params: { month } });
  return res.data.data;
}

export async function generateInsights(month) {
  const res = await client.post('/ai/insights', { month }, withSession());
  return res.data.data;
}
