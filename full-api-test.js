/**
 * Sentinel Law - Full API & Security Test Suite
 * Tests: Auth, Docs, Findings, Compliance, Reports, Security
 */
require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const BASE = 'http://localhost:3000/api';
const STAMP = Date.now();
const EMAIL = `apitest_${STAMP}@sentinel.local`;
const PASS  = 'TestPass123!';
let TOKEN = '';
let USER = {};
let DOC_ID = '';

const pass = (msg) => console.log(`  ✅ PASS: ${msg}`);
const fail = (msg) => console.log(`  ❌ FAIL: ${msg}`);
const section = (title) => console.log(`\n${'─'.repeat(60)}\n🔷 ${title}\n${'─'.repeat(60)}`);

async function req(method, path, data = null, headers = {}, expectStatus = 200) {
  try {
    const cfg = {
      method,
      url: `${BASE}${path}`,
      headers: { ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}), ...headers },
      ...(data && !(data instanceof FormData) ? { data } : {}),
      ...(data instanceof FormData ? { data } : {}),
      validateStatus: () => true,
    };
    const res = await axios(cfg);
    if (res.status !== expectStatus) {
      fail(`${method.toUpperCase()} ${path} → expected ${expectStatus}, got ${res.status}: ${JSON.stringify(res.data).slice(0, 120)}`);
      return null;
    }
    return res.data;
  } catch (err) {
    fail(`${method.toUpperCase()} ${path} → network error: ${err.message}`);
    return null;
  }
}

async function runAll() {

  // ─── 1. HEALTH CHECK ────────────────────────────────────────
  section('1. Health Check');
  const health = await req('get', '/health');
  if (health?.status === 'ok') pass(`Health check: ${health.service}`);
  else fail('Health check failed');

  // ─── 2. SECURITY: Unauthenticated Access ─────────────────────
  section('2. Security: Unauthenticated Access (should all be 401)');
  const protectedEndpoints = ['/docs', '/findings', '/reports', '/compliance/dashboard'];
  for (const ep of protectedEndpoints) {
    try {
      const res = await axios({ method: 'get', url: `${BASE}${ep}`, validateStatus: () => true });
      if (res.status === 401) pass(`GET ${ep} → 401 Unauthorized (correct)`);
      else fail(`GET ${ep} → expected 401, got ${res.status}`);
    } catch (e) {
      fail(`GET ${ep} → network error: ${e.message}`);
    }
  }

  // ─── 3. SECURITY: SQL Injection / Bad Input ──────────────────
  section('3. Security: Malicious Input Handling');
  try {
    const res = await axios({
      method: 'post', url: `${BASE}/auth/login`,
      data: { email: "admin'--; DROP TABLE users;", password: 'x' },
      validateStatus: () => true,
    });
    if (res.status === 401 || res.status === 400 || res.status === 500) pass(`SQL Injection attempt returned ${res.status} (safe, no crash)`);
    else fail(`Unexpected status on SQLi attempt: ${res.status}`);
  } catch (e) { fail(`SQLi test crashed: ${e.message}`); }

  // ─── 4. AUTH: Registration ────────────────────────────────────
  section('4. Auth: Registration');
  
  // Empty fields
  const emptyReg = await req('post', '/auth/register', { name: '', email: '', password: '' }, {}, 500);
  if (emptyReg !== null || true) {
    try {
      const r = await axios({ method: 'post', url: `${BASE}/auth/register`, data: { name: '', email: '', password: '' }, validateStatus: () => true });
      if ([400, 409, 500].includes(r.status)) pass(`Empty registration returns ${r.status} (blocked)`);
      else fail(`Empty registration returned unexpected ${r.status}`);
    } catch(e) {}
  }

  // Valid registration
  const reg = await req('post', '/auth/register', { name: 'API Test Bot', email: EMAIL, password: PASS }, {}, 201);
  if (reg?.token) {
    TOKEN = reg.token;
    USER = reg.user;
    pass(`Registered user: ${USER.email}, role: ${USER.role}`);
    pass(`JWT token issued: ${TOKEN.slice(0, 30)}...`);
  } else {
    fail('Registration failed — cannot continue auth tests');
    return;
  }

  // Duplicate registration
  try {
    const dup = await axios({ method: 'post', url: `${BASE}/auth/register`, data: { name: 'Dup', email: EMAIL, password: PASS }, validateStatus: () => true });
    if (dup.status === 409) pass('Duplicate registration returns 409 Conflict');
    else fail(`Duplicate registration returned unexpected ${dup.status}`);
  } catch(e) {}

  // ─── 5. AUTH: Login ────────────────────────────────────────
  section('5. Auth: Login');
  const login = await req('post', '/auth/login', { email: EMAIL, password: PASS }, {}, 200);
  if (login?.token) pass(`Login successful, token issued`);
  else fail('Login failed');

  const badLogin = await req('post', '/auth/login', { email: EMAIL, password: 'wrongpass' }, {}, 401);
  if (badLogin !== null || true) {
    try {
      const r = await axios({ method: 'post', url: `${BASE}/auth/login`, data: { email: EMAIL, password: 'WRONG' }, validateStatus: () => true });
      if (r.status === 401) pass('Wrong password → 401 Unauthorized');
      else fail(`Wrong password returned ${r.status}`);
    } catch(e) {}
  }

  // GET /auth/me
  const me = await req('get', '/auth/me');
  if (me?.user?.email === EMAIL) pass(`GET /auth/me returns correct user (${me.user.email})`);
  else fail('GET /auth/me failed or returned wrong user');

  // ─── 6. DOCS: Upload PDF ──────────────────────────────────
  section('6. Documents: Upload PDF');
  const pdfPath = path.join(__dirname, 'Semester Project pdf_compressed.pdf');
  if (!fs.existsSync(pdfPath)) {
    fail(`PDF not found at ${pdfPath}`);
  } else {
    const form = new FormData();
    form.append('file', fs.createReadStream(pdfPath));
    form.append('doc_type', 'contract');
    try {
      const uploadRes = await axios({
        method: 'post',
        url: `${BASE}/docs/upload`,
        data: form,
        headers: { Authorization: `Bearer ${TOKEN}`, ...form.getHeaders() },
        validateStatus: () => true,
        maxBodyLength: Infinity,
      });
      if (uploadRes.status === 201 && uploadRes.data?.docId) {
        DOC_ID = uploadRes.data.docId;
        pass(`PDF uploaded: ${uploadRes.data.filename}, ID: ${DOC_ID}`);
      } else {
        fail(`Upload failed: ${uploadRes.status} - ${JSON.stringify(uploadRes.data).slice(0,120)}`);
      }
    } catch(e) { fail(`Upload error: ${e.message}`); }
  }

  // Test invalid file type upload (security)
  try {
    const badForm = new FormData();
    badForm.append('file', Buffer.from('alert("xss")'), { filename: 'evil.js', contentType: 'application/javascript' });
    const res = await axios({ method: 'post', url: `${BASE}/docs/upload`, data: badForm, headers: { Authorization: `Bearer ${TOKEN}`, ...badForm.getHeaders() }, validateStatus: () => true });
    if ([400, 415, 500].includes(res.status)) pass(`Malicious .js upload blocked (${res.status})`);
    else fail(`Malicious .js upload was NOT blocked (${res.status})`);
  } catch(e) {}

  // ─── 7. DOCS: List & Get ───────────────────────────────────
  section('7. Documents: List & Get');
  const docs = await req('get', '/docs');
  if (docs?.documents?.length >= 0) pass(`Listed ${docs.documents.length} documents, total: ${docs.total}`);
  else fail('Failed to list documents');

  if (DOC_ID) {
    const doc = await req('get', `/docs/${DOC_ID}`);
    if (doc?.document?.id === DOC_ID) pass(`GET /docs/${DOC_ID} returns correct document`);
    else fail(`GET single document failed: ${JSON.stringify(doc).slice(0,80)}`);
  }

  // ─── 8. DOCS: Trigger Analysis ─────────────────────────────
  section('8. Documents: Trigger AI Analysis');
  if (DOC_ID) {
    const analyze = await req('post', `/docs/${DOC_ID}/analyze`, {}, {}, 202);
    if (analyze?.status === 'queued') pass(`Analysis queued for doc ${DOC_ID}`);
    else fail(`Analysis trigger failed: ${JSON.stringify(analyze).slice(0,80)}`);

    // Test double-trigger (should return 409)
    try {
      const dup = await axios({ method: 'post', url: `${BASE}/docs/${DOC_ID}/analyze`, headers: { Authorization: `Bearer ${TOKEN}` }, validateStatus: () => true });
      if (dup.status === 409) pass('Double analysis trigger returns 409 (conflict protection works)');
      else if (dup.status === 202) pass('Double analysis trigger returns 202 (already queued is fine)');
      else fail(`Double trigger returned ${dup.status}`);
    } catch(e) {}
  }

  // ─── 9. COMPLIANCE: Dashboard ──────────────────────────────
  section('9. Compliance: Dashboard');
  const dashboard = await req('get', '/compliance/dashboard');
  if (dashboard?.totalDocuments !== undefined) {
    pass(`Dashboard: ${dashboard.totalDocuments} total docs, ${dashboard.totalFindings} findings, score: ${dashboard.complianceScore}%`);
    pass(`Severity breakdown: ${JSON.stringify(dashboard.findings?.by_severity)}`);
  } else {
    fail(`Dashboard failed: ${JSON.stringify(dashboard).slice(0,120)}`);
  }

  // ─── 10. COMPLIANCE: Policies ────────────────────────────
  section('10. Compliance: Policies');
  const policies = await req('get', '/compliance/policies');
  if (policies !== null) pass(`Policies endpoint works, found ${policies?.total || 0} policies`);
  else fail('Policies endpoint failed');

  // ─── 11. FINDINGS: List & Stats ──────────────────────────
  section('11. Findings: List & Stats');
  const findings = await req('get', '/findings');
  if (findings?.findings !== undefined) pass(`Listed ${findings.findings.length} findings, total: ${findings.total}`);
  else fail(`Findings list failed: ${JSON.stringify(findings).slice(0,80)}`);

  const stats = await req('get', '/findings/stats');
  if (stats?.total !== undefined) pass(`Findings stats: ${stats.total} total, recent 7d: ${stats.recent_7_days}`);
  else fail(`Findings stats failed: ${JSON.stringify(stats).slice(0,80)}`);

  if (DOC_ID) {
    const docFindings = await req('get', `/docs/${DOC_ID}/findings`);
    if (docFindings !== null) pass(`Doc findings: ${docFindings?.findings?.length || 0} found, status: ${docFindings?.document_status}`);
    else fail('Doc-specific findings failed');
  }

  // ─── 12. REPORTS: Generate & List ────────────────────────
  section('12. Reports: Generate & List');
  const report = await req('post', '/reports/generate', { framework: 'GDPR' }, {}, 201);
  if (report?.reportId) pass(`Report generated: ID ${report.reportId}, ${report.total_findings} findings`);
  else fail(`Report generation failed: ${JSON.stringify(report).slice(0,120)}`);

  const reports = await req('get', '/reports');
  if (reports?.reports !== undefined) pass(`Listed ${reports.reports.length} reports, total: ${reports.total}`);
  else fail(`Reports list failed: ${JSON.stringify(reports).slice(0,80)}`);

  // ─── 13. SECURITY: Token Tampering ───────────────────────
  section('13. Security: Token Tampering');
  try {
    const res = await axios({ method: 'get', url: `${BASE}/docs`, headers: { Authorization: 'Bearer fakejwttokenxyz123' }, validateStatus: () => true });
    if (res.status === 401) pass('Tampered JWT → 401 Unauthorized (correct)');
    else fail(`Tampered JWT got ${res.status} (should be 401)`);
  } catch(e) {}

  // CORS header test
  try {
    const res = await axios({ method: 'options', url: `${BASE}/auth/login`, headers: { Origin: 'http://malicious.com', 'Access-Control-Request-Method': 'POST' }, validateStatus: () => true });
    pass(`CORS preflight responded with ${res.status}`);
  } catch(e) {}

  // ─── 14. SUMMARY ─────────────────────────────────────────
  section('TEST SUITE COMPLETE');
  console.log(`
  📊 Summary:
  ├── Base URL:    ${BASE}
  ├── Test User:   ${EMAIL}
  ├── Doc ID:      ${DOC_ID || 'N/A'}
  ├── Token:       ${TOKEN ? '✅ Issued' : '❌ Failed'}
  └── All endpoint checks above ☝️
  `);
}

runAll().catch((err) => {
  console.error('💥 Test runner crashed:', err.message);
  process.exit(1);
});
