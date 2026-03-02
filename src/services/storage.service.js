const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

/**
 * Ensure the upload directory exists.
 */
exports.ensureUploadDir = () => {
    const uploadPath = path.resolve(UPLOAD_DIR);
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
        console.log(`📁 Upload directory created: ${uploadPath}`);
    }
    return uploadPath;
};

/**
 * Delete a file from storage.
 * @param {string} filePath - Absolute or relative path to the file
 */
exports.deleteFile = (filePath) => {
    try {
        const absolutePath = path.resolve(filePath);
        if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
            console.log(`🗑️ File deleted: ${absolutePath}`);
            return true;
        }
        return false;
    } catch (err) {
        console.error(`Failed to delete file: ${err.message}`);
        return false;
    }
};

/**
 * Get the full path for a stored file.
 */
exports.getFilePath = (filename) => {
    return path.resolve(UPLOAD_DIR, filename);
};
