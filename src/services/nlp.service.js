const axios = require('axios');
const fs = require('fs');
const Finding = require('../models/Finding');
const Document = require('../models/Document');

const NLP_SERVICE_URL = process.env.NLP_SERVICE_URL || 'http://localhost:5001';

/**
 * Fire-and-forget NLP analysis.
 * Reads the uploaded file, sends text to the Python AI microservice,
 * saves returned findings, and updates document status.
 */
exports.analyze = async (doc) => {
    try {
        // Read the file content
        const fileText = fs.readFileSync(doc.source_url, 'utf-8');

        // Call the Python AI microservice
        const { data } = await axios.post(`${NLP_SERVICE_URL}/analyze`, {
            doc_id: doc._id.toString(),
            text: fileText,
            frameworks: ['GDPR', 'HIPAA'],
        }, {
            timeout: 120000, // 2 minute timeout for large documents
        });

        if (!data.findings || !Array.isArray(data.findings)) {
            throw new Error('Invalid response from NLP service — no findings array');
        }

        // Filter findings by confidence threshold ≥ 0.7
        const validFindings = data.findings
            .filter(f => f.confidence >= 0.7)
            .map(f => ({
                document_id: doc._id,
                risk_type: f.risk_type,
                severity: f.severity,
                confidence: f.confidence,
                description: f.description,
                evidence_snippet: f.evidence_snippet,
                clause_id: f.clause_id || null,
                policy_ref_id: f.policy_ref_id || null,
            }));

        if (validFindings.length > 0) {
            await Finding.insertMany(validFindings);
        }

        await Document.findByIdAndUpdate(doc._id, { status: 'completed' });
        console.log(`✅ Analysis completed for document ${doc._id} — ${validFindings.length} findings saved`);

    } catch (err) {
        await Document.findByIdAndUpdate(doc._id, { status: 'failed' });
        console.error(`❌ NLP analysis failed for document ${doc._id}:`, err.message);
    }
};
