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
        explanation: row.explanation,
        evidence_snippet: row.evidence_snippet,
        suggested_fix: row.suggested_fix,
        policy_ref_id: policyMap.get(row.policy_ref_id) || row.policy_ref_id,
        notes: row.notes,
        status: row.status,
        created_at: row.created_at,
    }));
};

/**
 * GET /api/findings
 * List all findings with filtering and pagination
 */
exports.listFindings = async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = Number(req.query.limit || 500);
        const offset = Number(req.query.offset || 0);
        const minConfidence = Number(req.query.min_confidence || 0.1);
        const { severity, risk_type, document_id } = req.query;

        // 1. Get user's document IDs
        const { data: userDocs, error: docsError } = await supabase
            .from('documents')
            .select('id')
            .eq('upload_user_id', userId);
        
        if (docsError) throw docsError;
        const userDocIds = (userDocs || []).map(d => d.id);

        if (userDocIds.length === 0) {
            return res.json({ findings: [], total: 0, pagination: { limit, offset, hasMore: false } });
        }

        // 2. Query findings filtered by user's documents
        let query = supabase
            .from('findings')
            .select('id, document_id, clause_id, risk_type, severity, confidence, description, evidence_snippet, suggested_fix, created_at, notes, status', { count: 'exact' })
            .in('document_id', userDocIds)
            .gte('confidence', minConfidence);

        if (severity) query = query.eq('severity', severity);
        if (risk_type) query = query.eq('risk_type', risk_type);
        if (document_id) {
            // Further filter if a specific doc_id was requested
            if (userDocIds.includes(document_id)) {
                query = query.eq('document_id', document_id);
            } else {
                return res.status(403).json({ message: 'Access denied to this document' });
            }
        }

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

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
 * GET /api/findings/stats
 * Get aggregated finding statistics
 */
exports.getStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

        // 1. Get user's document IDs
        const { data: userDocs, error: docsError } = await supabase
            .from('documents')
            .select('id')
            .eq('upload_user_id', userId);
        
        if (docsError) throw docsError;
        const userDocIds = (userDocs || []).map(d => d.id);

        if (userDocIds.length === 0) {
            return res.json({ by_severity: [], by_risk_type: [], recent_7_days: 0, total: 0 });
        }

        const [allRes, recentRes] = await Promise.all([
            supabase
                .from('findings')
                .select('severity, risk_type, confidence', { count: 'exact' })
                .in('document_id', userDocIds)
                .gte('confidence', 0.7),
            supabase
                .from('findings')
                .select('id', { count: 'exact' })
                .in('document_id', userDocIds)
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

/**
 * GET /api/findings/:id
 * Get a single finding by ID
 */
exports.getFinding = async (req, res) => {
    try {
        const userId = req.user.id;
        const { data, error } = await supabase
            .from('findings')
            .select('*, documents!inner(upload_user_id)')
            .eq('id', req.params.id)
            .eq('documents.upload_user_id', userId)
            .maybeSingle();

        if (error) throw error;
        if (!data) return res.status(404).json({ message: 'Finding not found or access denied' });

        const [finding] = await attachEntityMaps([data]);
        res.json({ finding });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch finding', error: err.message });
    }
};

/**
 * PATCH /api/findings/:id
 * Update finding (e.g. status, notes)
 */
exports.updateFinding = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status, notes } = req.body;
        
        // Check ownership first
        const { data: finding, error: checkError } = await supabase
            .from('findings')
            .select('id, documents!inner(upload_user_id)')
            .eq('id', req.params.id)
            .eq('documents.upload_user_id', userId)
            .maybeSingle();

        if (checkError) throw checkError;
        if (!finding) return res.status(404).json({ message: 'Finding not found or access denied' });

        const updates = {};
        if (status !== undefined) updates.status = status;
        if (notes !== undefined) updates.notes = notes;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }
        
        const { data, error } = await supabase
            .from('findings')
            .update(updates)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        
        res.json({ finding: { ...data, _id: data.id } });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update finding', error: err.message });
    }
};

/**
 * POST /api/findings/:id/generate-fix
 * Generate AI remediation suggestion for a finding
 */
exports.generateFixSuggestion = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        
        // 1. Check ownership and get details
        const { data: finding, error: fetchError } = await supabase
            .from('findings')
            .select('evidence_snippet, description, documents!inner(upload_user_id)')
            .eq('id', id)
            .eq('documents.upload_user_id', userId)
            .maybeSingle();
            
        if (fetchError) throw fetchError;
        if (!finding) return res.status(404).json({ message: 'Finding not found or access denied' });
        
        // 2. Call NLP service
        const nlpService = require('../services/nlp.service');
        const suggestedFix = await nlpService.generateFixSuggestion(
            finding.evidence_snippet,
            finding.description
        );
        
        // 3. Save suggested fix back to DB
        const { data: updated, error: updateError } = await supabase
            .from('findings')
            .update({ suggested_fix: suggestedFix })
            .eq('id', id)
            .select()
            .single();
            
        if (updateError) throw updateError;
        
        res.json({ suggested_fix: suggestedFix, finding: updated });
    } catch (err) {
        res.status(500).json({ message: 'Failed to generate AI remediation', error: err.message });
    }
};
