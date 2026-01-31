import express from 'express';
import multer from 'multer';
import { storage } from '../config/cloudinary';

const router = express.Router();

const upload = multer({ storage });

router.post('/', upload.single('image'), (req, res) => {
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

export default router;
