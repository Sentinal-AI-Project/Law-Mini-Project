const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    generated_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date_range: {
        start: { type: Date, required: true },
        end: { type: Date, required: true },
    },
    total_findings: {
        type: Number,
        default: 0,
    },
    critical_count: {
        type: Number,
        default: 0,
    },
    high_count: {
        type: Number,
        default: 0,
    },
    medium_count: {
        type: Number,
        default: 0,
    },
    low_count: {
        type: Number,
        default: 0,
    },
    file_url: {
        type: String, // path to exported PDF report
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

ReportSchema.index({ generated_by: 1, created_at: -1 });

module.exports = mongoose.model('Report', ReportSchema);
