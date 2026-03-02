const Policy = require('../models/Policy');
const Finding = require('../models/Finding');
const Document = require('../models/Document');

/**
 * GET /api/compliance/policies
 * List all active compliance policies/frameworks
 */
exports.listPolicies = async (req, res) => {
    try {
        const { framework, is_active = true } = req.query;

        const filter = { is_active: is_active === 'true' || is_active === true };
        if (framework) filter.framework = framework;

        const policies = await Policy.find(filter).sort({ framework: 1, name: 1 });
        res.json({ policies, total: policies.length });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch policies', error: err.message });
    }
};

/**
 * POST /api/compliance/policies
 * Create a new compliance policy (admin only)
 */
exports.createPolicy = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can create policies' });
        }

        const { name, framework, description, version, rules } = req.body;

        const policy = await Policy.create({
            name,
            framework,
            description,
            version,
            rules,
        });

        res.status(201).json({ policy });
    } catch (err) {
        res.status(500).json({ message: 'Failed to create policy', error: err.message });
    }
};

/**
 * GET /api/compliance/dashboard
 * Get overall compliance dashboard data
 */
exports.getDashboard = async (req, res) => {
    try {
        const [
            totalDocuments,
            pendingDocuments,
            analyzingDocuments,
            completedDocuments,
            totalFindings,
            severityBreakdown,
            riskTypeBreakdown,
            recentCriticalFindings,
        ] = await Promise.all([
            Document.countDocuments(),
            Document.countDocuments({ status: 'pending' }),
            Document.countDocuments({ status: 'analyzing' }),
            Document.countDocuments({ status: 'completed' }),
            Finding.countDocuments({ confidence: { $gte: 0.7 } }),
            Finding.aggregate([
                { $match: { confidence: { $gte: 0.7 } } },
                { $group: { _id: '$severity', count: { $sum: 1 } } },
            ]),
            Finding.aggregate([
                { $match: { confidence: { $gte: 0.7 } } },
                { $group: { _id: '$risk_type', count: { $sum: 1 } } },
            ]),
            Finding.find({ severity: 'critical', confidence: { $gte: 0.7 } })
                .populate('document_id', 'filename doc_type')
                .sort({ created_at: -1 })
                .limit(5),
        ]);

        res.json({
            documents: {
                total: totalDocuments,
                pending: pendingDocuments,
                analyzing: analyzingDocuments,
                completed: completedDocuments,
            },
            findings: {
                total: totalFindings,
                by_severity: severityBreakdown,
                by_risk_type: riskTypeBreakdown,
            },
            recent_critical: recentCriticalFindings,
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch dashboard data', error: err.message });
    }
};

/**
 * GET /api/compliance/check/:docId
 * Check compliance status for a specific document
 */
exports.checkCompliance = async (req, res) => {
    try {
        const doc = await Document.findById(req.params.docId);
        if (!doc) {
            return res.status(404).json({ message: 'Document not found' });
        }

        const findings = await Finding.find({
            document_id: req.params.docId,
            confidence: { $gte: 0.7 },
        })
            .populate('policy_ref_id', 'name framework')
            .sort({ severity: 1 });

        const hasCritical = findings.some(f => f.severity === 'critical');
        const hasHigh = findings.some(f => f.severity === 'high');

        res.json({
            document: {
                id: doc._id,
                filename: doc.filename,
                status: doc.status,
            },
            compliance_status: hasCritical ? 'non_compliant' : hasHigh ? 'at_risk' : 'compliant',
            total_findings: findings.length,
            findings,
        });
    } catch (err) {
        res.status(500).json({ message: 'Compliance check failed', error: err.message });
    }
};
