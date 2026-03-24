const supabase = require('../config/supabase');

/**
 * GET /api/compliance/policies
 * List all active compliance policies/frameworks
 */
exports.listPolicies = async (req, res) => {
    try {
        const { framework, is_active = true } = req.query;

        let query = supabase
            .from('policies')
            .select('id, name, framework, description, version, rules, is_active, created_at, updated_at')
            .eq('is_active', is_active === 'true' || is_active === true)
            .order('framework', { ascending: true })
            .order('name', { ascending: true });

        if (framework) {
            query = query.eq('framework', framework);
        }

        const { data, error } = await query;
        if (error) {
            throw error;
        }

        const policies = (data || []).map((p) => ({ ...p, _id: p.id }));
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

        const { data, error } = await supabase
            .from('policies')
            .insert({
                name,
                framework,
                description,
                version,
                rules: Array.isArray(rules) ? rules : [],
            })
            .select('id, name, framework, description, version, rules, is_active, created_at, updated_at')
            .single();

        if (error) {
            throw error;
        }

        res.status(201).json({ policy: { ...data, _id: data.id } });
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
        const [docsRes, findingsRes] = await Promise.all([
            supabase.from('documents').select('id, status', { count: 'exact' }),
            supabase.from('findings').select('id, severity, risk_type, confidence, created_at, document_id', { count: 'exact' }).gte('confidence', 0.7),
        ]);

        if (docsRes.error) throw docsRes.error;
        if (findingsRes.error) throw findingsRes.error;

        const docs = docsRes.data || [];
        const findings = findingsRes.data || [];

        const pendingDocuments = docs.filter((d) => d.status === 'pending').length;
        const analyzingDocuments = docs.filter((d) => d.status === 'analyzing').length;
        const completedDocuments = docs.filter((d) => d.status === 'completed' || d.status === 'analyzed').length;

        const severityMap = {};
        const riskTypeMap = {};
        for (const finding of findings) {
            severityMap[finding.severity] = (severityMap[finding.severity] || 0) + 1;
            riskTypeMap[finding.risk_type] = (riskTypeMap[finding.risk_type] || 0) + 1;
        }

        const critical = severityMap.critical || 0;
        const high = severityMap.high || 0;
        const medium = severityMap.medium || 0;
        const low = severityMap.low || 0;
        const weightedRisk = (critical * 4) + (high * 3) + (medium * 2) + low;
        const maxRisk = Math.max(findings.length * 4, 1);
        const complianceScore = Math.max(0, Math.min(100, Math.round(100 - (weightedRisk / maxRisk) * 100)));

        const severityBreakdown = Object.entries(severityMap).map(([key, count]) => ({ _id: key, count }));
        const riskTypeBreakdown = Object.entries(riskTypeMap).map(([key, count]) => ({ _id: key, count }));

        const criticalFindings = findings
            .filter((f) => f.severity === 'critical')
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 5)
            .map((f) => ({ ...f, _id: f.id }));

        // Backward-compatible + frontend-friendly dashboard keys.
        res.json({
            totalDocuments: docs.length,
            totalFindings: findings.length,
            complianceScore,
            processingCount: pendingDocuments + analyzingDocuments,
            documents: {
                total: docs.length,
                pending: pendingDocuments,
                analyzing: analyzingDocuments,
                completed: completedDocuments,
            },
            findings: {
                total: findings.length,
                by_severity: severityBreakdown,
                by_risk_type: riskTypeBreakdown,
            },
            recent_critical: criticalFindings,
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
        const { data: doc, error: docError } = await supabase
            .from('documents')
            .select('id, filename, status')
            .eq('id', req.params.docId)
            .maybeSingle();

        if (docError) {
            throw docError;
        }

        if (!doc) {
            return res.status(404).json({ message: 'Document not found' });
        }

        const { data: findings, error: findingsError } = await supabase
            .from('findings')
            .select('id, document_id, policy_ref_id, risk_type, severity, confidence, description, evidence_snippet, created_at')
            .eq('document_id', req.params.docId)
            .gte('confidence', 0.7)
            .order('created_at', { ascending: false });

        if (findingsError) {
            throw findingsError;
        }

        const policyIds = [...new Set((findings || []).map((f) => f.policy_ref_id).filter(Boolean))];
        let policyMap = new Map();
        if (policyIds.length) {
            const { data: policies, error: policiesError } = await supabase
                .from('policies')
                .select('id, name, framework')
                .in('id', policyIds);
            if (policiesError) {
                throw policiesError;
            }
            policyMap = new Map((policies || []).map((p) => [p.id, { ...p, _id: p.id }]));
        }

        const decoratedFindings = (findings || []).map((f) => ({
            ...f,
            _id: f.id,
            policy_ref_id: policyMap.get(f.policy_ref_id) || f.policy_ref_id,
        }));

        const hasCritical = decoratedFindings.some((f) => f.severity === 'critical');
        const hasHigh = decoratedFindings.some((f) => f.severity === 'high');

        res.json({
            document: {
                id: doc.id,
                _id: doc.id,
                filename: doc.filename,
                status: doc.status,
            },
            compliance_status: hasCritical ? 'non_compliant' : hasHigh ? 'at_risk' : 'compliant',
            total_findings: decoratedFindings.length,
            findings: decoratedFindings,
        });
    } catch (err) {
        res.status(500).json({ message: 'Compliance check failed', error: err.message });
    }
};
