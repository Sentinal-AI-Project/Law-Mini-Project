const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: [true, 'Filename is required'],
    },
    doc_type: {
        type: String,
        enum: ['contract', 'email', 'invoice', 'policy'],
        required: [true, 'Document type is required'],
    },
    upload_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    source_url: {
        type: String, // path to the stored file on disk
    },
    status: {
        type: String,
        enum: ['pending', 'analyzing', 'completed', 'failed'],
        default: 'pending',
    },
    uploaded_at: {
        type: Date,
        default: Date.now,
    },
});

// Index for efficient querying by user and status
DocumentSchema.index({ upload_user_id: 1, status: 1 });

module.exports = mongoose.model('Document', DocumentSchema);
