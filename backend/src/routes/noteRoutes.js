// backend/src/routes/noteRoutes.js

import express from 'express';
import { createNote, deleteNote, getAllowNotes, getNoteById, updateNote } from '../controllers/notesController.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// Cloudinary'yi .env dosyasındaki bilgilerle yapılandır
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer'a dosyaları yerel disk yerine Cloudinary'ye kaydetmesini söyleyen yapılandırma
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'notes_app_images', // Dosyaların Cloudinary hesabında hangi klasöre kaydedileceği
        allowed_formats: ['jpeg', 'png', 'jpg'], // İzin verilen dosya formatları
    },
});

const upload = multer({ storage: storage });

// Rotalar - Artık 'upload' middleware'i dosyaları doğrudan Cloudinary'ye gönderiyor
router.get('/', getAllowNotes);
router.get('/:id', getNoteById);
router.post('/', upload.single('image'), createNote);
router.put('/:id', upload.single('image'), updateNote);
router.delete('/:id', deleteNote);

export default router;