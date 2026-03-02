const mongoose = require('mongoose');

const FindingSchema = new mongoose.Schema({
    document_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: true,
    },
    clause_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clause',
    },
    risk_type: {
        type: String,
        enum: ['data_breach', 'policy_violation', 'gap'],
        required: true,
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        required: true,
    },
    confidence: {
        type: Number,
        min: 0,
        max: 1,
        required: true,
    },
    description: {
        type: String,
        required: [true, 'Finding description is required'],
    },
    evidence_snippet: {
        type: String,
    },
    policy_ref_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Policy',
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

// Index for querying findings by document & severity
FindingSchema.index({ document_id: 1, severity: 1 });
// Index for confidence threshold filtering
FindingSchema.index({ confidence: 1 });

module.exports = mongoose.model('Finding', FindingSchema);
