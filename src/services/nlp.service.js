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
exports.analyze = async (doc, selectedFrameworks = ['General']) => {
    const docId = doc.id || doc._id;

    try {
        let fileUrlOrPath = doc.source_url;

        // If it's a Supabase URL, create a signed URL for secure backend-to-backend access
        if (doc.source_url.includes('supabase.co')) {
            const filePath = doc.source_url.split('/storage/v1/object/public/documents/')[1];
            if (filePath) {
                const { data: signedData, error: signedError } = await supabase.storage
                    .from('documents')
                    .createSignedUrl(filePath, 300); // 5 minute expiry

                if (signedError) {
                    console.error(`Failed to create signed URL for doc ${docId}:`, signedError.message);
                } else {
                    fileUrlOrPath = signedData.signedUrl;
                }
            }
        }

        const { data } = await axios.post(`${NLP_SERVICE_URL}/analyze`, {
            doc_id: String(docId),
            file_path: fileUrlOrPath,
            frameworks: selectedFrameworks,
        }, {
            timeout: 300000, // 5 minutes for large docs
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
                description: f.description || f.explanation || f.reason || f.finding || 'Detailed finding analysis available in document.',
                evidence_snippet: f.evidence_snippet,
                suggested_fix: f.suggested_fix || null,
                clause_id: f.clause_id || null,
                policy_ref_id: f.policy_ref_id || null,
            }));

        if (validFindings.length > 0) {
            // Clear existing findings for this document to prevent duplicates on re-analysis
            await supabase.from('findings').delete().eq('document_id', docId);

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

/**
 * Generate a specific remediation suggestion for a single finding on demand.
 */
exports.generateFixSuggestion = async (clause, explanation) => {
    try {
        const { data } = await axios.post(`${NLP_SERVICE_URL}/generate-fix`, {
            clause,
            explanation
        }, {
            timeout: 60000 // 1 minute timeout for LLM generation
        });

        return data.suggested_fix || null;
    } catch (err) {
        console.error(`Remediation generation failed: ${err.message}`);
        throw err;
    }
};
