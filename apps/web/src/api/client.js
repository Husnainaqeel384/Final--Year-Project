import axios from 'axios';
import { logger } from '../lib/logger';

export const client = axios.create({
  baseURL: '/api/v1',
  // The session lives in an httpOnly cookie, out of reach of any injected script.
  withCredentials: true,
});

// Read straight from storage so this module does not import the store, which would be circular.
client.interceptors.request.use((config) => {
  const organizationId = localStorage.getItem('activeOrganizationId');
  if (organizationId) config.headers['X-Organization-Id'] = organizationId;
  return config;
});

let onUnauthorized = () => {};

/** Lets the app decide how to react to an expired session without coupling this file to Redux. */
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      onUnauthorized();
    } else if (!error.response || error.response.status >= 500) {
      logger.error('API request failed', error.config?.url, error.message);
    }
    return Promise.reject(error);
  },
);

export function getErrorMessage(error) {
  return error.response?.data?.message || 'Something went wrong. Please try again.';
}

/** Streams a protected file through axios so the session cookie and workspace header are sent. */
export async function downloadFile(path, filename) {
  const response = await client.get(path, { responseType: 'blob' });
  const url = URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
