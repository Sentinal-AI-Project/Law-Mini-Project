const reportService = require('../services/report.service');
const Report = require('../models/Report');

/**
 * POST /api/reports/generate
 * Generate a new compliance report for a date range
 */
exports.generate = async (req, res) => {
    try {
        const { start_date, end_date } = req.body;

        if (!start_date || !end_date) {
            return res.status(400).json({ message: 'start_date and end_date are required' });
        }

        if (new Date(start_date) > new Date(end_date)) {
            return res.status(400).json({ message: 'start_date must be before end_date' });
        }

        const report = await reportService.generateReport({
            userId: req.user.id,
            startDate: start_date,
            endDate: end_date,
        });

        res.status(201).json({
            reportId: report._id,
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
        const { limit = 20, offset = 0 } = req.query;

        const reports = await Report.find({ generated_by: req.user.id })
            .sort({ created_at: -1 })
            .skip(+offset)
            .limit(+limit);

        const total = await Report.countDocuments({ generated_by: req.user.id });

        res.json({
            reports,
            total,
            pagination: {
                limit: +limit,
                offset: +offset,
                hasMore: (+offset + +limit) < total,
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
