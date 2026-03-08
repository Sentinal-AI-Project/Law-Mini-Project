const mongoose = require('mongoose');

const PolicySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Policy name is required'],
        trim: true,
    },
    framework: {
        type: String,
        enum: ['GDPR', 'HIPAA', 'SOX', 'PCI_DSS', 'ISO_27001', 'CCPA', 'OTHER'],
        required: true,
    },
    description: {
        type: String,
    },
    version: {
        type: String,
        default: '1.0',
    },
    rules: [{
        rule_id: String,
        rule_text: String,
        category: String,
    }],
    is_active: {
        type: Boolean,
        default: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
});

PolicySchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
});

module.exports = mongoose.model('Policy', PolicySchema);
