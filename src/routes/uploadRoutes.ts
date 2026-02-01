import express from 'express';
import multer from 'multer';
import { storage } from '../config/cloudinary';

const router = express.Router();

const MAX_FILE_SIZE = 250 * 1024; // 250KB in bytes

const upload = multer({
    storage,
    limits: {
        fileSize: MAX_FILE_SIZE
    },
    fileFilter: (req, file, cb) => {
        const allowedFormats = ['image/webp', 'image/jpeg', 'image/jpg'];
        if (allowedFormats.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only WebP and JPEG formats are allowed'));
        }
    }
});

router.post('/', (req, res) => {
    upload.single('image')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    message: 'File size too large. Maximum size is 250KB',
                    error: 'FILE_TOO_LARGE'
                });
            }
            return res.status(400).json({
                message: 'Upload error',
                error: err.message
            });
        } else if (err) {
            return res.status(400).json({
                message: err.message,
                error: 'INVALID_FORMAT'
            });
        }

        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }
            res.json({
                message: 'Image uploaded successfully',
                filePath: (req.file as any).path // Cloudinary returns the full URL in .path
            });
        } catch (error) {
            res.status(500).json({ message: 'Upload failed', error });
        }
    });
});

export default router;
