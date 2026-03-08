const Document = require('../models/Document');
const Finding = require('../models/Finding');
const nlpService = require('../services/nlp.service');

/**
 * POST /api/docs/upload
 * Upload a document
 */
exports.upload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const doc = await Document.create({
            filename: req.file.originalname,
            doc_type: req.body.doc_type || 'contract',
            upload_user_id: req.user.id,
            source_url: req.file.path,
        });

        res.status(201).json({
            docId: doc._id,
            filename: doc.filename,
            status: doc.status,
            uploaded_at: doc.uploaded_at,
        });
    } catch (err) {
        res.status(500).json({ message: 'Upload failed', error: err.message });
    }
};

/**
 * POST /api/docs/:id/analyze
 * Trigger NLP analysis for a document (non-blocking)
 */
exports.analyze = async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) {
            return res.status(404).json({ message: 'Document not found' });
        }

        if (doc.status === 'analyzing') {
            return res.status(409).json({ message: 'Analysis already in progress' });
        }

        // Update status and trigger async NLP
        await Document.findByIdAndUpdate(doc._id, { status: 'analyzing' });
        nlpService.analyze(doc); // fire and forget — non-blocking

        res.status(202).json({
            analysisId: doc._id,
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
        const { limit = 10, offset = 0, severity, min_confidence } = req.query;

        // Build filter
        const filter = { document_id: req.params.id };
        if (severity) filter.severity = severity;
        if (min_confidence) filter.confidence = { $gte: parseFloat(min_confidence) };

        const findings = await Finding.find(filter)
            .populate('clause_id', 'clause_text clause_type')
            .populate('policy_ref_id', 'name framework')
            .sort({ severity: 1, confidence: -1 })
            .skip(+offset)
            .limit(+limit);

        const total = await Finding.countDocuments(filter);

        // Also fetch document status so frontend knows if analysis is complete
        const doc = await Document.findById(req.params.id).select('status');

        res.json({
            findings,
            total,
            document_status: doc?.status || 'unknown',
            pagination: {
                limit: +limit,
                offset: +offset,
                hasMore: (+offset + +limit) < total,
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
        const { limit = 20, offset = 0, status, doc_type } = req.query;

        const filter = { upload_user_id: req.user.id };
        if (status) filter.status = status;
        if (doc_type) filter.doc_type = doc_type;

        const documents = await Document.find(filter)
            .sort({ uploaded_at: -1 })
            .skip(+offset)
            .limit(+limit);

        const total = await Document.countDocuments(filter);

        res.json({
            documents,
            total,
            pagination: {
                limit: +limit,
                offset: +offset,
                hasMore: (+offset + +limit) < total,
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
        const doc = await Document.findById(req.params.id).populate('upload_user_id', 'name email');
        if (!doc) {
            return res.status(404).json({ message: 'Document not found' });
        }
        res.json({ document: doc });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch document', error: err.message });
    }
};
