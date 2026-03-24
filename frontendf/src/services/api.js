/**
 * Centralized API service for Sentinel-Law backend.
 * All requests are forwarded through the Vite dev-server proxy (/api → http://localhost:3000/api).
 */

const BASE_URL = '/api';

/** Return the stored JWT token (or null). */
const getToken = () => localStorage.getItem('sl_token');

/** Build standard headers, injecting the Bearer token when present. */
const buildHeaders = (extra = {}) => {
  const headers = { 'Content-Type': 'application/json', ...extra };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

/** Generic request helper. Throws on non-2xx responses. */
const request = async (method, path, body = null, customHeaders = {}) => {
  const options = {
    method,
    headers: buildHeaders(customHeaders),
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed: ${res.status}`);
  return data;
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authAPI = {
  /** POST /api/auth/register */
  register: (name, email, password) =>
    request('POST', '/auth/register', { name, email, password }),

  /** POST /api/auth/login */
  login: (email, password) =>
    request('POST', '/auth/login', { email, password }),

  /** GET /api/auth/me */
  me: () => request('GET', '/auth/me'),
};

// ─── Documents ────────────────────────────────────────────────────────────────

export const docsAPI = {
  /** GET /api/docs */
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request('GET', `/docs${qs ? `?${qs}` : ''}`);
  },

  /** GET /api/docs/:id */
  get: (id) => request('GET', `/docs/${id}`),

  /** POST /api/docs/upload — multipart */
  upload: (file, docType = 'contract') => {
    const form = new FormData();
    form.append('file', file);
    form.append('doc_type', docType);

    const token = getToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    // Do NOT set Content-Type — browser sets multipart boundary automatically.

    return fetch(`${BASE_URL}/docs/upload`, { method: 'POST', headers, body: form })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || `Upload failed: ${res.status}`);
        return data;
      });
  },

  /** POST /api/docs/:id/analyze */
  analyze: (id) => request('POST', `/docs/${id}/analyze`),

  /** GET /api/docs/:id/findings */
  findings: (id, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request('GET', `/docs/${id}/findings${qs ? `?${qs}` : ''}`);
  },
};

// ─── Findings ─────────────────────────────────────────────────────────────────

export const findingsAPI = {
  /** GET /api/findings */
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request('GET', `/findings${qs ? `?${qs}` : ''}`);
  },

  /** GET /api/findings/stats */
  stats: () => request('GET', '/findings/stats'),

  /** GET /api/findings/:id */
  get: (id) => request('GET', `/findings/${id}`),
};

// ─── Reports ──────────────────────────────────────────────────────────────────

export const reportsAPI = {
  /** GET /api/reports */
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request('GET', `/reports${qs ? `?${qs}` : ''}`);
  },

  /** GET /api/reports/:id */
  get: (id) => request('GET', `/reports/${id}`),

  /** POST /api/reports/generate */
  generate: (docId, framework) =>
    request('POST', '/reports/generate', { docId, framework }),
};

// ─── Compliance ───────────────────────────────────────────────────────────────

export const complianceAPI = {
  /** GET /api/compliance/dashboard */
  dashboard: () => request('GET', '/compliance/dashboard'),

  /** GET /api/compliance/policies */
  listPolicies: () => request('GET', '/compliance/policies'),

  /** GET /api/compliance/check/:docId */
  check: (docId) => request('GET', `/compliance/check/${docId}`),
};

// ─── Health ───────────────────────────────────────────────────────────────────

export const healthAPI = {
  /** GET /api/health */
  check: () => request('GET', '/health'),
};
