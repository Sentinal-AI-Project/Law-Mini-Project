const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const API_BASE = 'http://localhost:3000/api';
const TEST_EMAIL = `test_${Date.now()}@sentinel.local`;
const TEST_PASS = 'Password123!';
const PDF_NAME = 'Semester Project pdf_compressed.pdf';

async function fullTest() {
  console.log('🚀 Starting Sentinel Law Integration Test...');

  try {
    // 1. REGISTER
    console.log('--- Step 1: Registration ---');
    const regRes = await axios.post(`${API_BASE}/auth/register`, {
      name: 'Integration Test Bot',
      email: TEST_EMAIL,
      password: TEST_PASS
    });
    const token = regRes.data.token;
    console.log('✅ Registered! Token acquired.');

    const headers = { Authorization: `Bearer ${token}` };

    // 2. UPLOAD
    console.log('--- Step 2: Uploading PDF ---');
    const pdfPath = path.join(__dirname, PDF_NAME);
    if (!fs.existsSync(pdfPath)) throw new Error(`PDF not found in root: ${PDF_NAME}`);
    
    const form = new FormData();
    form.append('file', fs.createReadStream(pdfPath));
    form.append('framework', 'GDPR');

    const uploadRes = await axios.post(`${API_BASE}/docs/upload`, form, {
      headers: { ...headers, ...form.getHeaders() }
    });
    const docId = uploadRes.data.docId;
    console.log(`✅ Upload Successful! Document ID: ${docId}`);

    // 3. ANALYZE
    console.log('--- Step 3: Triggering AI Analysis ---');
    const analyzeRes = await axios.post(`${API_BASE}/docs/${docId}/analyze`, {}, { headers });
    console.log(`✅ Analysis Triggered: ${analyzeRes.data.message}`);

    // 4. CHECK FINDINGS (Wait for Python to process)
    console.log('--- Step 4: Waiting for AI processing... ---');
    let findings = [];
    let attempts = 0;
    while (attempts < 10) {
      await new Promise(r => setTimeout(r, 10000)); // Wait 10s per attempt
      attempts++;
      console.log(`Attempt ${attempts}: Checking for findings...`);
      const getFindings = await axios.get(`${API_BASE}/docs/${docId}/findings`, { headers });
      findings = getFindings.data.findings;
      if (findings && findings.length > 0) break;
    }

    if (findings.length > 0) {
      console.log('✅ DONE! Found AI audit results:');
      findings.forEach((f, i) => {
        console.log(`  [${i+1}] ${f.risk_type.toUpperCase()} (${f.severity}): ${f.description.substring(0, 100)}...`);
      });
    } else {
      console.log('❌ TIMEOUT: No findings generated. Check Python logs.');
    }

  } catch (err) {
    if (err.response) {
      console.error('❌ Integration Test Failed (Backend Error):', err.response.status, err.response.data);
    } else {
      console.error('❌ Integration Test Failed:', err.message);
    }
  }
}

fullTest();
