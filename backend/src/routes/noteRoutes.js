// backend/src/routes/noteRoutes.js

import express from 'express';
import { createNote, deleteNote, getAllowNotes, getNoteById, updateNote } from '../controllers/notesController.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'notes_app_images',
        allowed_formats: ['jpeg', 'png', 'jpg', 'webp'], // webp gibi modern formatları da ekleyebilirsiniz
    },
});

// --- DEĞİŞİKLİK BURADA ---
// 'upload' middleware'ini yapılandırırken 'limits' özelliğini ekleyin
const upload = multer({ 
    storage: storage,
    limits: {
        // 5 MB = 5 * 1024 * 1024 bayt
        fileSize: 5 * 1024 * 1024 
    }
});
// -------------------------

router.get('/', getAllowNotes);
router.get('/:id', getNoteById);
router.post('/', upload.single('image'), createNote);
router.put('/:id', upload.single('image'), updateNote);
router.delete('/:id', deleteNote);

export default router;