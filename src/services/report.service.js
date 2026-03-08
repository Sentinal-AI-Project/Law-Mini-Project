const Finding = require('../models/Finding');
const Report = require('../models/Report');

/**
 * Generate a compliance report for findings within a date range.
 * Aggregates finding counts by severity and creates a Report record.
 */
exports.generateReport = async ({ userId, startDate, endDate }) => {
    const dateFilter = {
        created_at: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
        },
    };

    // Aggregate findings by severity
    const pipeline = [
        { $match: dateFilter },
        {
            $group: {
                _id: '$severity',
                count: { $sum: 1 },
            },
        },
    ];

    const severityCounts = await Finding.aggregate(pipeline);

    // Build count map
    const countMap = {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
    };

    let totalFindings = 0;
    for (const item of severityCounts) {
        if (countMap.hasOwnProperty(item._id)) {
            countMap[item._id] = item.count;
        }
        totalFindings += item.count;
    }

    // Create the report record
    const report = await Report.create({
        generated_by: userId,
        date_range: {
            start: new Date(startDate),
            end: new Date(endDate),
        },
        total_findings: totalFindings,
        critical_count: countMap.critical,
        high_count: countMap.high,
        medium_count: countMap.medium,
        low_count: countMap.low,
    });

    return report;
};

/**
 * Get detailed findings for a specific report's date range.
 */
exports.getReportDetails = async (reportId) => {
    const report = await Report.findById(reportId).populate('generated_by', 'name email');
    if (!report) return null;

    const findings = await Finding.find({
        created_at: {
            $gte: report.date_range.start,
            $lte: report.date_range.end,
        },
    })
        .populate('document_id', 'filename doc_type')
        .sort({ severity: 1, confidence: -1 });

    return { report, findings };
};
