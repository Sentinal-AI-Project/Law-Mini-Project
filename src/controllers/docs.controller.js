const supabase = require('../config/supabase');
const nlpService = require('../services/nlp.service');

const mapDocument = (row) => {
    let risk_level = 'Low';
    let findings_count = 0;

    if (row.findings && Array.isArray(row.findings)) {
        findings_count = row.findings.length;
        if (row.findings.some(f => f.severity === 'critical')) risk_level = 'Critical';
        else if (row.findings.some(f => f.severity === 'high')) risk_level = 'High';
        else if (row.findings.some(f => f.severity === 'medium')) risk_level = 'Medium';
    }

    return {
        _id: row.id,
        id: row.id,
        filename: row.filename,
        doc_type: row.doc_type,
        upload_user_id: row.upload_user_id,
        file_url: row.source_url,
        status: row.status,
        uploaded_at: row.uploaded_at,
        risk_level,
        findings_count
    };
};

const mapFinding = (row) => ({
    _id: row.id,
    id: row.id,
    document_id: row.document_id,
    clause_id: row.clause_id,
    risk_type: row.risk_type,
    severity: row.severity,
    confidence: row.confidence,
    description: row.description,
    evidence_snippet: row.evidence_snippet,
    suggested_fix: row.suggested_fix,
    policy_ref_id: row.policy_ref_id,
    created_at: row.created_at,
});

/**
 * POST /api/docs/upload
 * Upload a document
 */
exports.upload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const filePath = `${req.user.id}/${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.\-]/g, '_')}`;

        // Upload to Supabase Storage bucket
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, req.file.buffer, {
                contentType: req.file.mimetype,
                upsert: false
            });

        if (uploadError) {
            throw uploadError;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('documents')
            .getPublicUrl(filePath);

        const sourceUrl = urlData.publicUrl;

        // Save metadata to DB
        const payload = {
            filename: req.file.originalname,
            doc_type: req.body.doc_type || 'contract',
            upload_user_id: req.user.id,
            source_url: sourceUrl,
            status: 'pending',
        };

        // Defensive check for 'frameworks' column (will skip if migration hasn't run)
        if (req.body.frameworks) {
            try {
                payload.frameworks = typeof req.body.frameworks === 'string' 
                    ? JSON.parse(req.body.frameworks) 
                    : req.body.frameworks;
            } catch (e) {
                console.warn('Malformed frameworks JSON, defaulting to empty array');
                payload.frameworks = [];
            }
        }

        const { data: doc, error } = await supabase
            .from('documents')
            .insert(payload)
            .select('id, filename, status, uploaded_at')
            .single();

        if (error) {
            // Fallback for missing frameworks column if insert fails
            if (error.message?.includes('column "frameworks"')) {
                delete payload.frameworks;
                const { data: retryDoc, error: retryError } = await supabase
                    .from('documents')
                    .insert(payload)
                    .select('id, filename, status, uploaded_at')
                    .single();
                if (retryError) throw retryError;

                const userController = require('./user.controller');
                await userController.logActivity(req.user.id, 'Document Uploaded', { filename: retryDoc.filename });
                nlpService.analyze({ ...retryDoc, source_url: sourceUrl }, []);

                return res.status(201).json({ docId: retryDoc.id, filename: retryDoc.filename, status: retryDoc.status });
            }
            throw error;
        }

        // Log upload activity
        const userController = require('./user.controller');
        await userController.logActivity(req.user.id, 'Document Uploaded', { filename: doc.filename });

        // Trigger analysis automatically
        nlpService.analyze({ ...doc, source_url: sourceUrl }, payload.frameworks);

        res.status(201).json({
            docId: doc.id,
            filename: doc.filename,
            status: doc.status,
            uploaded_at: doc.uploaded_at,
        });
    } catch (err) {
        console.error('Upload Error:', err);
        res.status(500).json({ 
            message: 'Upload failed', 
            error: err.message,
            stack: err.stack,
            details: err.details 
        });
    }
};

/**
 * POST /api/docs/upload-metadata
 * Register a document uploaded directly to Supabase Storage by the frontend
 */
exports.uploadMetadata = async (req, res) => {
    try {
        const { filename, doc_type, source_url, frameworks } = req.body;

        if (!filename || !source_url) {
            return res.status(400).json({ message: 'Missing required metadata (filename, source_url)' });
        }

        const payload = {
            filename,
            doc_type: doc_type || 'contract',
            upload_user_id: req.user.id,
            source_url,
            status: 'pending',
            frameworks: Array.isArray(frameworks) ? frameworks : []
        };

        const { data: doc, error } = await supabase
            .from('documents')
            .insert(payload)
            .select('id, filename, status, uploaded_at')
            .single();

        if (error) {
            console.error('DB Insert Error:', error);
            throw error;
        }

        // Log upload activity
        const userController = require('./user.controller');
        await userController.logActivity(req.user.id, 'Document Uploaded (Serverless)', { filename: doc.filename });

        // Trigger analysis automatically (Serverless Automation)
        nlpService.analyze({ ...doc, source_url: payload.source_url }, payload.frameworks);

        res.status(201).json({
            docId: doc.id,
            filename: doc.filename,
            status: doc.status,
            uploaded_at: doc.uploaded_at,
        });
    } catch (err) {
        console.error('Metadata Upload Error:', err);
        res.status(500).json({ 
            message: 'Metadata registration failed', 
            error: err.message,
            details: err.details 
        });
    }
};




/**
 * POST /api/docs/:id/analyze
 * Trigger NLP analysis for a document (non-blocking)
 */
exports.analyze = async (req, res) => {
    try {
        const { data: doc, error } = await supabase
            .from('documents')
            .select('*')
            .eq('id', req.params.id)
            .maybeSingle();

        if (error) {
            throw error;
        }

        if (!doc) {
            return res.status(404).json({ message: 'Document not found' });
        }

        if (doc.status === 'analyzing') {
            return res.status(409).json({ message: 'Analysis already in progress' });
        }

        const { error: updateError } = await supabase
            .from('documents')
            .update({ status: 'analyzing' })
            .eq('id', doc.id);

        if (updateError) {
            throw updateError;
        }

        nlpService.analyze({ ...doc, _id: doc.id }, doc.frameworks);

        res.status(202).json({
            analysisId: doc.id,
            status: 'queued',
            message: 'Analysis started. Poll GET /api/docs/:id/findings for results.',
        });
    } catch (err) {
        res.status(500).json({ message: 'Analysis trigger failed', error: err.message });
    }
};

/**
 * GET /api/docs/:id/findings
 * Get findings for a specific document (with pagination)
 */
exports.getFindings = async (req, res) => {
    try {
        const limit = Number(req.query.limit || 10);
        const offset = Number(req.query.offset || 0);
        const { severity } = req.query;
        const minConfidence = Number(req.query.min_confidence || 0);

        let query = supabase
            .from('findings')
            .select('id, document_id, clause_id, risk_type, severity, confidence, description, evidence_snippet, policy_ref_id, created_at, notes, status', { count: 'exact' })
            .eq('document_id', req.params.id)
            .gte('confidence', minConfidence);

        if (severity) {
            query = query.eq('severity', severity);
        }

        const { data: findingRows, error: findingsError, count } = await query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (findingsError) {
            throw findingsError;
        }

        const findings = (findingRows || []).map(mapFinding);

        const { data: doc, error: docError } = await supabase
            .from('documents')
            .select('status')
            .eq('id', req.params.id)
            .maybeSingle();

        if (docError) {
            throw docError;
        }

        res.json({
            findings,
            total: count || 0,
            document_status: doc?.status || 'unknown',
            pagination: {
                limit,
                offset,
                hasMore: (offset + limit) < (count || 0),
            },
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch findings', error: err.message });
    }
};

/**
 * GET /api/docs
 * List all documents for the authenticated user (with pagination)
 */
exports.listDocuments = async (req, res) => {
    try {
        const limit = Number(req.query.limit || 20);
        const offset = Number(req.query.offset || 0);
        const { status, doc_type } = req.query;

        let query = supabase
            .from('documents')
            .select('id, filename, doc_type, upload_user_id, source_url, status, uploaded_at, findings(id, severity)', { count: 'exact' })
            .eq('upload_user_id', req.user.id);

        if (status) {
            if (status === 'analyzed') {
                query = query.in('status', ['analyzed', 'completed']);
            } else {
                query = query.eq('status', status);
            }
        }

        if (doc_type) {
            query = query.eq('doc_type', doc_type);
        }

        const { data, error, count } = await query
            .order('uploaded_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            throw error;
        }

        const documents = (data || []).map(mapDocument);

        res.json({
            documents,
            total: count || 0,
            pagination: {
                limit,
                offset,
                hasMore: (offset + limit) < (count || 0),
            },
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to list documents', error: err.message });
    }
};

/**
 * GET /api/docs/:id
 * Get a single document by ID
 */
exports.getDocument = async (req, res) => {
    try {
        const { data: doc, error } = await supabase
            .from('documents')
            .select('id, filename, doc_type, upload_user_id, source_url, status, uploaded_at, findings(id, severity)')
            .eq('id', req.params.id)
            .maybeSingle();

        if (error) {
            throw error;
        }

        if (!doc) {
            return res.status(404).json({ message: 'Document not found' });
        }

        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id, name, email')
            .eq('id', doc.upload_user_id)
            .maybeSingle();

        if (userError) {
            throw userError;
        }

        res.json({
            document: {
                ...mapDocument(doc),
                upload_user_id: user ? { id: user.id, _id: user.id, name: user.name, email: user.email } : null,
            },
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch document', error: err.message });
    }
};
/**
 * DELETE /api/docs/:id
 * Delete a document and its associated findings/reports
 */
exports.deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Get document to check ownership and get storage path
        const { data: doc, error: docError } = await supabase
            .from('documents')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (docError) throw docError;
        if (!doc) return res.status(404).json({ message: 'Document not found' });

        // Security check: must be the uploader or an admin (if roles added)
        if (doc.upload_user_id !== req.user.id) {
            return res.status(403).json({ message: 'You do not have permission to delete this document' });
        }

        // 2. Delete associated findings
        await supabase.from('findings').delete().eq('document_id', id);

        // 3. Delete associated reports
        await supabase.from('reports').delete().eq('document_id', id);

        // 4. Delete the document entry
        const { error: deleteError } = await supabase
            .from('documents')
            .delete()
            .eq('id', id);

        if (deleteError) throw deleteError;

        // 5. Delete from Supabase storage if we have a path
        if (doc.source_url) {
            try {
                // Extract path from public URL if possible (or we could store path in DB)
                // For now, we'll try to extract it. URL format is usually .../storage/v1/object/public/documents/PATH
                const urlParts = doc.source_url.split('/documents/');
                if (urlParts.length > 1) {
                    const storagePath = decodeURIComponent(urlParts[1]);
                    await supabase.storage.from('documents').remove([storagePath]);
                }
            } catch (storageErr) {
                console.warn('Failed to delete file from storage:', storageErr.message);
                // We don't fail the whole request if storage delete fails
            }
        }

        // 6. Log activity
        const userController = require('./user.controller');
        await userController.logActivity(req.user.id, 'Document Deleted', { filename: doc.filename });

        res.json({ message: 'Document and all associated data deleted successfully' });
    } catch (err) {
        console.error('Delete Document Error:', err);
        res.status(500).json({ message: 'Failed to delete document', error: err.message });
    }
};
