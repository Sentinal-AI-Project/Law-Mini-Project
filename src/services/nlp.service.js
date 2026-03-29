const axios = require('axios');
const fs = require('fs');
const path = require('path');
const supabase = require('../config/supabase');

const NLP_SERVICE_URL = process.env.NLP_SERVICE_URL || 'http://localhost:5001';

/**
 * Fire-and-forget NLP analysis.
 * Reads the uploaded file, sends text to the Python AI microservice,
 * saves returned findings, and updates document status.
 */
exports.analyze = async (doc) => {
    const docId = doc.id || doc._id;

    try {
        const fileUrlOrPath = doc.source_url.startsWith('http') 
            ? doc.source_url 
            : path.resolve(doc.source_url);

        const { data } = await axios.post(`${NLP_SERVICE_URL}/analyze`, {
            doc_id: String(docId),
            file_path: fileUrlOrPath,
            frameworks: ['GDPR', 'HIPAA'],
        }, {
            timeout: 120000,
        });

        if (!data.findings || !Array.isArray(data.findings)) {
            throw new Error('Invalid response from NLP service — no findings array');
        }

        const validFindings = data.findings
            .map((f) => ({
                document_id: docId,
                risk_type: f.risk_type,
                severity: f.severity,
                confidence: f.confidence,
                description: f.description,
                evidence_snippet: f.evidence_snippet,
                clause_id: f.clause_id || null,
                policy_ref_id: f.policy_ref_id || null,
            }));

        if (validFindings.length > 0) {
            const { error: insertError } = await supabase.from('findings').insert(validFindings);
            if (insertError) {
                throw insertError;
            }
        }

        const { error: updateError } = await supabase
            .from('documents')
            .update({ status: 'analyzed' })
            .eq('id', docId);

        if (updateError) {
            throw updateError;
        }

        console.log(`Analysis completed for document ${docId} - ${validFindings.length} findings saved`);
    } catch (err) {
        await supabase
            .from('documents')
            .update({ status: 'failed' })
            .eq('id', docId);

        console.error(`NLP analysis failed for document ${docId}: ${err.message}`);
    }
};
