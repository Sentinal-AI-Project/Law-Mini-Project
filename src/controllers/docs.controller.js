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
        const { data: doc, error } = await supabase
            .from('documents')
            .insert({
                filename: req.file.originalname,
                doc_type: req.body.doc_type || 'contract',
                upload_user_id: req.user.id,
                source_url: sourceUrl,
                status: 'pending',
            })
            .select('id, filename, status, uploaded_at')
            .single();

        if (error) {
            throw error;
        }

        res.status(201).json({
            docId: doc.id,
            filename: doc.filename,
            status: doc.status,
            uploaded_at: doc.uploaded_at,
        });
    } catch (err) {
        console.error('Upload Error:', err);
        res.status(500).json({ message: 'Upload failed', error: err.message });
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

        nlpService.analyze({ ...doc, _id: doc.id });

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
            .select('id, document_id, clause_id, risk_type, severity, confidence, description, evidence_snippet, policy_ref_id, created_at', { count: 'exact' })
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
