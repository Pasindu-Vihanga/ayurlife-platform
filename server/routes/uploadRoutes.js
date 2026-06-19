import path from 'path';
import fs from 'fs';
import express from 'express';
import multer from 'multer';

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|webp|avif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error(`Invalid file type. Allowed: jpg, jpeg, png, webp, avif. Received: ${file.mimetype}`));
    }
}

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

router.post('/', (req, res) => {
    console.log('=== Upload request received ===');

    // Create a wrapper to handle multer errors
    const uploadSingle = upload.single('image');

    uploadSingle(req, res, (err) => {
        if (err) {
            console.error('=== Multer error ===');
            console.error('Error:', err);
            return res.status(400).json({
                message: err.message || 'File upload failed',
                error: err.toString()
            });
        }

        if (!req.file) {
            console.error('=== No file in request ===');
            return res.status(400).json({ message: 'No file uploaded' });
        }

        try {
            const imagePath = `/${req.file.path.replace(/\\/g, '/')}`;
            console.log('=== Upload successful ===');
            console.log('Path:', imagePath);

            res.send({
                message: 'Image uploaded successfully',
                image: imagePath,
            });
        } catch (error) {
            console.error('=== Error processing response ===');
            console.error(error);
            res.status(500).json({ message: 'Server error processing file' });
        }
    });
});

export default router;
