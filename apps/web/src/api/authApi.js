import { client } from './client';

export async function login(credentials) {
  const res = await client.post('/auth/login', credentials);
  return res.data.data;
}

export async function register(details) {
  const res = await client.post('/auth/register', details);
  return res.data;
}

export async function logout() {
  await client.post('/auth/logout');
}

export async function fetchMe() {
  const res = await client.get('/auth/me');
  return res.data.data;
}

export async function updateMe(details) {
  const res = await client.patch('/auth/me', details);
  return res.data.data;
}

export async function uploadAvatar(file) {
  const form = new FormData();
  form.append('file', file);
  const res = await client.post('/auth/me/avatar', form);
  return res.data.data;
}

export async function changePassword(passwords) {
  const res = await client.post('/auth/me/password', passwords);
  return res.data;
}

export async function forgotPassword(email) {
  const res = await client.post('/auth/forgot-password', { email });
  return res.data;
}

export async function resetPassword(payload) {
  const res = await client.post('/auth/reset-password', payload);
  return res.data;
}

export async function updatePreferences(preferences) {
  const res = await client.patch('/auth/me/preferences', preferences);
  return res.data.data;
}
