const Finding = require('../models/Finding');

/**
 * GET /api/findings
 * List all findings with filtering and pagination
 */
exports.listFindings = async (req, res) => {
    try {
        const {
            limit = 20,
            offset = 0,
            severity,
            risk_type,
            min_confidence = 0.7,
            document_id,
        } = req.query;

        const filter = {
            confidence: { $gte: parseFloat(min_confidence) },
        };

        if (severity) filter.severity = severity;
        if (risk_type) filter.risk_type = risk_type;
        if (document_id) filter.document_id = document_id;

        const findings = await Finding.find(filter)
            .populate('document_id', 'filename doc_type status')
            .populate('clause_id', 'clause_text clause_type')
            .populate('policy_ref_id', 'name framework')
            .sort({ created_at: -1 })
            .skip(+offset)
            .limit(+limit);

        const total = await Finding.countDocuments(filter);

        res.json({
            findings,
            total,
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
 * GET /api/findings/:id
 * Get a single finding by ID
 */
exports.getFinding = async (req, res) => {
    try {
        const finding = await Finding.findById(req.params.id)
            .populate('document_id', 'filename doc_type')
            .populate('clause_id', 'clause_text clause_type')
            .populate('policy_ref_id', 'name framework description');

        if (!finding) {
            return res.status(404).json({ message: 'Finding not found' });
        }

        res.json({ finding });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch finding', error: err.message });
    }
};

/**
 * GET /api/findings/stats
 * Get aggregated finding statistics
 */
exports.getStats = async (req, res) => {
    try {
        const [bySeverity, byRiskType, recentFindings] = await Promise.all([
            // Count by severity
            Finding.aggregate([
                { $match: { confidence: { $gte: 0.7 } } },
                { $group: { _id: '$severity', count: { $sum: 1 } } },
                { $sort: { _id: 1 } },
            ]),
            // Count by risk type
            Finding.aggregate([
                { $match: { confidence: { $gte: 0.7 } } },
                { $group: { _id: '$risk_type', count: { $sum: 1 } } },
                { $sort: { _id: 1 } },
            ]),
            // Recent findings (last 7 days)
            Finding.countDocuments({
                confidence: { $gte: 0.7 },
                created_at: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            }),
        ]);

        res.json({
            by_severity: bySeverity,
            by_risk_type: byRiskType,
            recent_7_days: recentFindings,
            total: await Finding.countDocuments({ confidence: { $gte: 0.7 } }),
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch stats', error: err.message });
    }
};
