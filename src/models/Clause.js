const mongoose = require('mongoose');

const ClauseSchema = new mongoose.Schema({
    document_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: true,
    },
    clause_text: {
        type: String,
        required: [true, 'Clause text is required'],
    },
    clause_type: {
        type: String,
        enum: ['termination', 'liability', 'indemnity', 'confidentiality', 'data_processing', 'other'],
        default: 'other',
    },
    position: {
        start: { type: Number }, // character offset start
        end: { type: Number },   // character offset end
    },
    extracted_at: {
        type: Date,
        default: Date.now,
    },
});

ClauseSchema.index({ document_id: 1 });

module.exports = mongoose.model('Clause', ClauseSchema);
