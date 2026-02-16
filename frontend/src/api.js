/**
 * CareQueue AI - API Client
 */

// Dev: use /api (Vite proxy to localhost:5000). Prod: use Render backend if VITE_API_URL not set.
const API_BASE = import.meta.env.VITE_API_URL
  || (import.meta.env.PROD ? 'https://carequeue-ai.onrender.com/api' : '/api');

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
  let res;
  try {
    res = await fetch(url, config);
  } catch (err) {
    const msg = err.message || 'Network error';
    if (msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('network')) {
      throw new Error('Cannot reach server. If using Render free tier, the server may be waking up—try again in 30 seconds.');
    }
    throw new Error(msg);
  }
  const text = await res.text();
  const data = text ? (() => { try { return JSON.parse(text); } catch { return {}; } })() : {};
  if (!res.ok) {
    const msg = data.message || data.error || `Request failed (${res.status})`;
    if (res.status === 502 || res.status === 503) {
      throw new Error('Server is starting up (Render free tier). Please try again in 30 seconds.');
    }
    throw new Error(msg);
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
