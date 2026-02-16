/**
 * CareQueue AI - API Client
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }
  const res = await fetch(url, config);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

export const api = {
  // Patient registration
  registerPatient: (data) => request('/patients', { method: 'POST', body: data }),
  
  // Queue
  getQueue: () => request('/queue'),
  updateStatus: (id, status) => request(`/queue/${id}/status`, {
    method: 'PATCH',
    body: { status },
  }),
  clearCompleted: () => request('/queue/completed', { method: 'DELETE' }),
  
  // Auth
  login: (username, password) => request('/auth/login', {
    method: 'POST',
    body: { username, password },
  }),
  
  // Reports
  getDailyReport: () => request('/reports/daily'),
  getDailyLog: () => request('/reports/log'),
};
