const reportService = require('../services/report.service');
const supabase = require('../config/supabase');

/**
 * POST /api/reports/generate
 * Generate a new compliance report for a date range or from a document selection.
 */
exports.generate = async (req, res) => {
    try {
        let { start_date, end_date, docId, framework } = req.body;

        // Frontend sends { docId, framework } in local mode; fallback to last 30 days.
        if (!start_date || !end_date) {
            const end = new Date();
            const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            start_date = start.toISOString().slice(0, 10);
            end_date = end.toISOString().slice(0, 10);
        }

        if (new Date(start_date) > new Date(end_date)) {
            return res.status(400).json({ message: 'start_date must be before end_date' });
        }

        const report = await reportService.generateReport({
            userId: req.user.id,
            startDate: start_date,
            endDate: end_date,
            framework: framework || null,
            documentId: docId || null,
        });

        res.status(201).json({
            _id: report.id,
            reportId: report.id,
            framework: report.framework,
            total_findings: report.total_findings,
            critical_count: report.critical_count,
            high_count: report.high_count,
            medium_count: report.medium_count,
            low_count: report.low_count,
            created_at: report.created_at,
        });
    } catch (err) {
        res.status(500).json({ message: 'Report generation failed', error: err.message });
    }
};

/**
 * GET /api/reports
 * List all reports for the authenticated user
 */
exports.listReports = async (req, res) => {
    try {
        const limit = Number(req.query.limit || 20);
        const offset = Number(req.query.offset || 0);

        const { data, error, count } = await supabase
            .from('reports')
            .select('id, generated_by, start_date, end_date, framework, total_findings, critical_count, high_count, medium_count, low_count, file_url, created_at', { count: 'exact' })
            .eq('generated_by', req.user.id)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            throw error;
        }

        const reports = (data || []).map((r) => ({ ...r, _id: r.id }));

        res.json({
            reports,
            total: count || 0,
            pagination: {
                limit,
                offset,
                hasMore: (offset + limit) < (count || 0),
            },
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to list reports', error: err.message });
    }
};

/**
 * GET /api/reports/:id
 * Get a single report with its associated findings
 */
exports.getReport = async (req, res) => {
    try {
        const result = await reportService.getReportDetails(req.params.id);
        if (!result) {
            return res.status(404).json({ message: 'Report not found' });
        }
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch report', error: err.message });
    }
};
