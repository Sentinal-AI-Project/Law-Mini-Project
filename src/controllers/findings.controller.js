const supabase = require('../config/supabase');

const attachEntityMaps = async (findings) => {
    if (!findings.length) return findings;

    const documentIds = [...new Set(findings.map((f) => f.document_id).filter(Boolean))];
    const clauseIds = [...new Set(findings.map((f) => f.clause_id).filter(Boolean))];
    const policyIds = [...new Set(findings.map((f) => f.policy_ref_id).filter(Boolean))];

    const [docRes, clauseRes, policyRes] = await Promise.all([
        documentIds.length
            ? supabase.from('documents').select('id, filename, doc_type, status').in('id', documentIds)
            : Promise.resolve({ data: [], error: null }),
        clauseIds.length
            ? supabase.from('clauses').select('id, clause_text, clause_type').in('id', clauseIds)
            : Promise.resolve({ data: [], error: null }),
        policyIds.length
            ? supabase.from('policies').select('id, name, framework, description').in('id', policyIds)
            : Promise.resolve({ data: [], error: null }),
    ]);

    if (docRes.error) throw docRes.error;
    if (clauseRes.error) throw clauseRes.error;
    if (policyRes.error) throw policyRes.error;

    const docMap = new Map((docRes.data || []).map((d) => [d.id, { _id: d.id, ...d }]));
    const clauseMap = new Map((clauseRes.data || []).map((c) => [c.id, { _id: c.id, ...c }]));
    const policyMap = new Map((policyRes.data || []).map((p) => [p.id, { _id: p.id, ...p }]));

    return findings.map((row) => ({
        _id: row.id,
        id: row.id,
        document_id: docMap.get(row.document_id) || row.document_id,
        clause_id: clauseMap.get(row.clause_id) || row.clause_id,
        risk_type: row.risk_type,
        severity: row.severity,
        confidence: row.confidence,
        description: row.description,
        evidence_snippet: row.evidence_snippet,
        policy_ref_id: policyMap.get(row.policy_ref_id) || row.policy_ref_id,
        created_at: row.created_at,
    }));
};

/**
 * GET /api/findings
 * List all findings with filtering and pagination
 */
exports.listFindings = async (req, res) => {
    try {
        const limit = Number(req.query.limit || 20);
        const offset = Number(req.query.offset || 0);
        const minConfidence = Number(req.query.min_confidence || 0.7);
        const { severity, risk_type, document_id } = req.query;

        let query = supabase
            .from('findings')
            .select('id, document_id, clause_id, risk_type, severity, confidence, description, evidence_snippet, policy_ref_id, created_at', { count: 'exact' })
            .gte('confidence', minConfidence);

        if (severity) query = query.eq('severity', severity);
        if (risk_type) query = query.eq('risk_type', risk_type);
        if (document_id) query = query.eq('document_id', document_id);

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            throw error;
        }

        const findings = await attachEntityMaps(data || []);

        res.json({
            findings,
            total: count || 0,
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
 * GET /api/findings/:id
 * Get a single finding by ID
 */
exports.getFinding = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('findings')
            .select('id, document_id, clause_id, risk_type, severity, confidence, description, evidence_snippet, policy_ref_id, created_at')
            .eq('id', req.params.id)
            .maybeSingle();

        if (error) {
            throw error;
        }

        if (!data) {
            return res.status(404).json({ message: 'Finding not found' });
        }

        const [finding] = await attachEntityMaps([data]);
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
        const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

        const [allRes, recentRes] = await Promise.all([
            supabase
                .from('findings')
                .select('severity, risk_type, confidence', { count: 'exact' })
                .gte('confidence', 0.7),
            supabase
                .from('findings')
                .select('id', { count: 'exact' })
                .gte('confidence', 0.7)
                .gte('created_at', since),
        ]);

        if (allRes.error) throw allRes.error;
        if (recentRes.error) throw recentRes.error;

        const severityCount = {};
        const riskTypeCount = {};

        for (const f of allRes.data || []) {
            severityCount[f.severity] = (severityCount[f.severity] || 0) + 1;
            riskTypeCount[f.risk_type] = (riskTypeCount[f.risk_type] || 0) + 1;
        }

        const bySeverity = Object.entries(severityCount).map(([key, count]) => ({ _id: key, count }));
        const byRiskType = Object.entries(riskTypeCount).map(([key, count]) => ({ _id: key, count }));

        res.json({
            by_severity: bySeverity,
            by_risk_type: byRiskType,
            recent_7_days: recentRes.count || 0,
            total: allRes.count || 0,
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch stats', error: err.message });
    }
};
