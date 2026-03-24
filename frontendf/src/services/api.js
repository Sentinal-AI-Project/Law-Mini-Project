/**
 * Centralized API service for Sentinel-Law backend.
 * All requests are forwarded through the Vite dev-server proxy (/api → http://localhost:3000/api).
 */

const BASE_URL = '/api';
const DEMO_MODE = (import.meta.env.VITE_DEMO_MODE ?? 'true') !== 'false';

const DEMO_FINDINGS = [
  {
    _id: 'finding-1',
    severity: 'high',
    confidence: 0.94,
    description: 'Unencrypted Personal Data Storage',
    explanation: 'Customer PII was stored without encryption in violation of GDPR Article 32.',
    created_at: '2026-03-23T10:00:00.000Z',
    clause_id: {
      clause_text:
        'Personal data shall be processed with appropriate security, including protection against accidental loss and unauthorized access.',
    },
    policy_ref_id: {
      name: 'GDPR Article 32 - Security of Processing',
      framework: 'GDPR',
    },
  },
  {
    _id: 'finding-2',
    severity: 'medium',
    confidence: 0.83,
    description: 'Missing Data Retention Policy',
    explanation: 'No explicit policy for retention period is present in uploaded policy documents.',
    created_at: '2026-03-22T12:15:00.000Z',
    clause_id: {
      clause_text: 'Data retention periods shall be defined and documented for all critical data classes.',
    },
    policy_ref_id: {
      name: 'ISO 27001 A.8.10 - Information Deletion',
      framework: 'ISO 27001',
    },
  },
  {
    _id: 'finding-3',
    severity: 'low',
    confidence: 0.72,
    description: 'Weak Password Requirement Language',
    explanation: 'Password policy does not enforce complexity for privileged accounts.',
    created_at: '2026-03-21T09:30:00.000Z',
    clause_id: {
      clause_text: 'All user passwords should follow complexity requirements and periodic rotation.',
    },
    policy_ref_id: {
      name: 'NIST 800-63B',
      framework: 'NIST',
    },
  },
];

const DEMO_DOCS = [
  {
    _id: 'doc-1',
    filename: 'Security_Policy_2024.pdf',
    doc_type: 'policy',
    status: 'analyzed',
    uploaded_at: '2026-03-20T10:00:00.000Z',
  },
  {
    _id: 'doc-2',
    filename: 'Compliance_Report_Q1.docx',
    doc_type: 'report',
    status: 'analyzed',
    uploaded_at: '2026-03-19T11:20:00.000Z',
  },
  {
    _id: 'doc-3',
    filename: 'Vendor_Contract_Main.txt',
    doc_type: 'contract',
    status: 'processing',
    uploaded_at: '2026-03-18T08:45:00.000Z',
  },
];

const parsePath = (path) => path.split('?')[0];

const getMockResponse = (method, path, body) => {
  const cleanPath = parsePath(path);

  if (method === 'POST' && (cleanPath === '/auth/login' || cleanPath === '/auth/register')) {
    return {
      token: 'demo-token',
      user: {
        _id: 'user-demo',
        name: 'Demo User',
        email: typeof body?.email === 'string' ? body.email : 'demo@sentinel.local',
      },
    };
  }

  if (method === 'GET' && cleanPath === '/auth/me') {
    return {
      user: { _id: 'user-demo', name: 'Demo User', email: 'demo@sentinel.local' },
    };
  }

  if (method === 'GET' && cleanPath === '/docs') {
    return { documents: DEMO_DOCS };
  }

  if (method === 'POST' && cleanPath === '/docs/upload') {
    const filename = body instanceof FormData ? body.get('file')?.name : null;
    return {
      message: 'Uploaded (demo mode)',
      docId: `demo-doc-${Date.now()}`,
      filename: filename || 'demo-uploaded-file.pdf',
    };
  }

  if (method === 'POST' && /^\/docs\/.+\/analyze$/.test(cleanPath)) {
    return {
      message: 'Analysis started (demo mode)',
      status: 'analyzing',
    };
  }

  if (method === 'GET' && /^\/docs\/.+\/findings$/.test(cleanPath)) {
    return { findings: DEMO_FINDINGS };
  }

  if (method === 'GET' && cleanPath === '/findings') {
    return { findings: DEMO_FINDINGS };
  }

  if (method === 'GET' && cleanPath === '/findings/stats') {
    return { total: DEMO_FINDINGS.length };
  }

  if (method === 'GET' && cleanPath === '/reports') {
    return {
      reports: [
        { _id: 'report-1', framework: 'GDPR', created_at: new Date(Date.now() - 86400000).toISOString() },
      ],
    };
  }

  if (method === 'POST' && cleanPath === '/reports/generate') {
    return {
      _id: `report-${Date.now()}`,
      framework: body?.framework || 'GDPR',
      created_at: new Date().toISOString(),
    };
  }

  if (method === 'GET' && cleanPath === '/compliance/dashboard') {
    return {
      totalDocuments: DEMO_DOCS.length,
      totalFindings: DEMO_FINDINGS.length,
      complianceScore: 87,
      processingCount: DEMO_DOCS.filter((d) => d.status !== 'analyzed').length,
    };
  }

  if (method === 'GET' && cleanPath === '/compliance/policies') {
    return {
      policies: [
        { id: 'p-1', name: 'GDPR Article 32', framework: 'GDPR' },
        { id: 'p-2', name: 'SOX 404', framework: 'SOX' },
      ],
    };
  }

  if (method === 'GET' && /^\/compliance\/check\/.+/.test(cleanPath)) {
    return { status: 'ok', score: 87, findings: DEMO_FINDINGS.length };
  }

  if (method === 'GET' && cleanPath === '/health') {
    return { status: 'ok', mode: 'demo' };
  }

  return null;
};

/** Return the stored JWT token (or null). */
const getToken = () => localStorage.getItem('sl_token');

/** Build standard headers, injecting the Bearer token when present. */
const buildHeaders = (extra = {}, includeJson = true) => {
  const headers = { ...extra };
  if (includeJson) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

/** Generic request helper. Throws on non-2xx responses. */
const request = async (method, path, body = null, customHeaders = {}) => {
  const isFormData = body instanceof FormData;
  const options = {
    method,
    headers: buildHeaders(customHeaders, !isFormData),
  };
  if (body) options.body = isFormData ? body : JSON.stringify(body);

  try {
    const res = await fetch(`${BASE_URL}${path}`, options);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || `Request failed: ${res.status}`);
    return data;
  } catch (err) {
    if (DEMO_MODE) {
      const mock = getMockResponse(method, path, body);
      if (mock !== null) return mock;
    }
    throw err;
  }
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

    return request('POST', '/docs/upload', form);
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
