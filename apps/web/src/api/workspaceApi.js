import { client } from './client';

const data = (res) => res.data.data;

export const fetchReminders = (params) => client.get('/reminders', { params }).then(data);
export const createReminder = (reminder) => client.post('/reminders', reminder).then(data);
export const updateReminder = (id, reminder) =>
  client.patch(`/reminders/${id}`, reminder).then(data);
export const completeReminder = (id, body) => client.post(`/reminders/${id}/complete`, body).then(data);
export const fetchReminderAlerts = (params) => client.get('/reminders/alerts', { params }).then(data);
export const reopenReminder = (id) => client.post(`/reminders/${id}/reopen`).then(data);
export const deleteReminder = (id) => client.delete(`/reminders/${id}`);

export const fetchNotes = (params) => client.get('/notes', { params }).then(data);
/** `note` is { title, body, pinned }. */
export const createNote = (note) => client.post('/notes', note).then(data);
/** Any of title, body and pinned. */
export const updateNote = (id, changes) => client.patch(`/notes/${id}`, changes).then(data);
export const deleteNote = (id) => client.delete(`/notes/${id}`);

export const fetchContacts = () => client.get('/splits/contacts').then(data);
export const addContact = (username) => client.post('/splits/contacts', { username }).then(data);
export const deleteContact = (id) => client.delete(`/splits/contacts/${id}`);
export const fetchGroups = () => client.get('/splits/groups').then(data);
export const fetchGroup = (id) => client.get(`/splits/groups/${id}`).then(data);
export const createGroup = (group) => client.post('/splits/groups', group).then(data);
export const deleteGroup = (id) => client.delete(`/splits/groups/${id}`);
export const addBill = (id, bill) => client.post(`/splits/groups/${id}/bills`, bill).then(data);
export const settleBill = (id, amount) =>
  client.post(`/splits/groups/${id}/settle`, { amount }).then(data);

export const fetchOrganizations = () => client.get('/organizations').then(data);
export const createOrganization = (org) => client.post('/organizations', org).then(data);
export const fetchOrganization = (id) => client.get(`/organizations/${id}`).then(data);
export const updateOrganization = (id, org) =>
  client.patch(`/organizations/${id}`, org).then(data);
export const deleteOrganization = (id) => client.delete(`/organizations/${id}`);
export const inviteMember = (id, invite) =>
  client.post(`/organizations/${id}/invitations`, invite).then(data);
export const revokeInvitation = (id, invitationId) =>
  client.delete(`/organizations/${id}/invitations/${invitationId}`);
export const acceptInvitation = (token) =>
  client.post('/organizations/invitations/accept', { token }).then(data);
export const updateMemberRole = (id, userId, role) =>
  client.patch(`/organizations/${id}/members/${userId}`, { role }).then(data);
export const removeMember = (id, userId) =>
  client.delete(`/organizations/${id}/members/${userId}`);

export const fetchUsers = () => client.get('/admin/users').then(data);
export const updateUserRole = (id, role) =>
  client.patch(`/admin/users/${id}`, { role }).then(data);
export const deleteUser = (id) => client.delete(`/admin/users/${id}`);

export const fetchFeeds = () => client.get('/integrations/feeds').then(data);
export const createFeed = (kind) => client.post('/integrations/feeds', { kind }).then(data);
export const deleteFeed = (id) => client.delete(`/integrations/feeds/${id}`);
export const fetchWebhooks = () => client.get('/integrations/webhooks').then(data);
export const createWebhook = (webhook) =>
  client.post('/integrations/webhooks', webhook).then(data);
export const deleteWebhook = (id) => client.delete(`/integrations/webhooks/${id}`);
export const testWebhook = (id) => client.post(`/integrations/webhooks/${id}/test`).then(data);

export async function importSpreadsheet(dataset, file) {
  const form = new FormData();
  form.append('file', file);
  const res = await client.post(`/integrations/import/${dataset}`, form);
  return res.data.data;
}
