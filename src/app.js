require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const storageService = require('./services/storage.service');

// ─── Security Imports ──────────────────────────────────────
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const app = express();

// ─── Middleware ───────────────────────────────────────────
// Security Headers
app.use(helmet());

// CORS Configuration
app.use(cors({
    origin: process.env.CLIENT_URL || '*', // Update with your frontend URL in production
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Data Sanitization against NoSQL Query Injection
app.use(mongoSanitize());

// Data Sanitization against XSS
app.use(xss());

// Serve uploaded files statically (optional, for development)
app.use('/uploads', express.static('uploads'));

// ─── Health Check ────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'sentinel-law-backend',
        timestamp: new Date().toISOString(),
    });
});

// ─── Routes ──────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/docs', require('./routes/docs.routes'));
app.use('/api/findings', require('./routes/findings.routes'));
app.use('/api/reports', require('./routes/reports.routes'));
app.use('/api/compliance', require('./routes/compliance.routes'));

// ─── 404 Handler ─────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// ─── Global Error Handler ────────────────────────────────
app.use((err, req, res, next) => {
    console.error('❌ Unhandled error:', err);

    // Multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ message: 'File too large. Maximum size is 10MB.' });
    }

    if (err.message && err.message.includes('Unsupported file type')) {
        return res.status(415).json({ message: err.message });
    }

    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});

// ─── Start Server ────────────────────────────────────────
const PORT = process.env.PORT || 3000;

const startServer = async () => {
    // Connect to MongoDB
    await connectDB();

    // Ensure upload directory exists
    storageService.ensureUploadDir();

    app.listen(PORT, () => {
        console.log(`\n🚀 Sentinel Law Backend running on port ${PORT}`);
        console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
        console.log(`🔗 API base:     http://localhost:${PORT}/api\n`);
    });
};

startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});

module.exports = app;
