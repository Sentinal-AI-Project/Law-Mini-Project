const supabase = require('../config/supabase');

/**
 * Generate a compliance report for findings within a date range.
 * Aggregates finding counts by severity and creates a report row.
 */
exports.generateReport = async ({ userId, startDate, endDate, framework, documentId }) => {
    const startIso = new Date(`${startDate}T00:00:00.000Z`).toISOString();
    const endIso = new Date(`${endDate}T23:59:59.999Z`).toISOString();

    let findingsQuery = supabase
        .from('findings')
        .select('severity, created_at, policy_ref_id, document_id')
        .gte('created_at', startIso)
        .lte('created_at', endIso);

    if (documentId) {
        findingsQuery = findingsQuery.eq('document_id', documentId);
    }

    const { data: findings, error: findingsError } = await findingsQuery;
    if (findingsError) {
        throw findingsError;
    }

    const countMap = {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
    };

    for (const item of findings || []) {
        if (Object.prototype.hasOwnProperty.call(countMap, item.severity)) {
            countMap[item.severity] += 1;
        }
    }

    const totalFindings = (findings || []).length;

    const { data: report, error: insertError } = await supabase
        .from('reports')
        .insert({
            generated_by: userId,
            start_date: startDate,
            end_date: endDate,
            framework: framework || null,
            total_findings: totalFindings,
            critical_count: countMap.critical,
            high_count: countMap.high,
            medium_count: countMap.medium,
            low_count: countMap.low,
        })
        .select('id, generated_by, start_date, end_date, framework, total_findings, critical_count, high_count, medium_count, low_count, file_url, created_at')
        .single();

    if (insertError) {
        throw insertError;
    }

    return report;
};

/**
 * Get detailed findings for a specific report's date range.
 */
exports.getReportDetails = async (reportId) => {
    const { data: report, error: reportError } = await supabase
        .from('reports')
        .select('id, generated_by, start_date, end_date, framework, total_findings, critical_count, high_count, medium_count, low_count, file_url, created_at')
        .eq('id', reportId)
        .maybeSingle();

    if (reportError) {
        throw reportError;
    }

    if (!report) return null;

    const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('id', report.generated_by)
        .maybeSingle();

    if (userError) {
        throw userError;
    }

    const startIso = new Date(`${report.start_date}T00:00:00.000Z`).toISOString();
    const endIso = new Date(`${report.end_date}T23:59:59.999Z`).toISOString();

    const { data: findings, error: findingsError } = await supabase
        .from('findings')
        .select('id, document_id, severity, confidence, risk_type, description, evidence_snippet, policy_ref_id, clause_id, created_at')
        .gte('created_at', startIso)
        .lte('created_at', endIso)
        .order('created_at', { ascending: false });

    if (findingsError) {
        throw findingsError;
    }

    return {
        report: {
            ...report,
            _id: report.id,
            generated_by: user ? { ...user, _id: user.id } : null,
        },
        findings: (findings || []).map((f) => ({ ...f, _id: f.id })),
    };
};
