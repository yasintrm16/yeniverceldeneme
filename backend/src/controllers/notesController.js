// backend/src/controllers/notesController.js

import Note from "../models/Note.js";
import { v2 as cloudinary } from 'cloudinary';
// --- FIX: IMPORT CloudinaryStorage and multer ---
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
// -----------------------------------------

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'notes',
        allowed_formats: ['jpeg', 'png', 'jpg', 'webp'],

        // --- OPTİMİZASYON AYARLARI BURAYA TAŞINIYOR ---
        transformation: [
            { width: 1200, height: 1200, crop: "limit" },
            { quality: "auto:good", fetch_format: "auto" }
        ]
        // ---------------------------------------------
    },
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }
});

export async function getAllowNotes(_, res) {
    try {
        const notes = await Note.find().sort({ createdAt: -1 });
        res.status(200).json(notes);
    } catch (error) {
        console.error("Error getAllowNotes controller", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getNoteById(req, res) {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) return res.status(404).json({ message: "Note not found!" });
        res.json(note);
    } catch (error) {
        console.error("Error in getNoteById controller", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// --- GÜNCELLENMİŞ ve OPTİMİZE EDİLMİŞ createNote FONKSİYONU ---
export async function createNote(req, res) {
    try {
        const { title, content, subtitle } = req.body;
        const newNote = new Note({ title, content, subtitle });

        if (req.file) {
            // Middleware'in yüklediği ve optimize ettiği bilgileri kullan
            newNote.image = {
                url: req.file.path,
                public_id: req.file.filename
            };
        }

        const savedNote = await newNote.save();
        res.status(201).json(savedNote);
    } catch (error) {
        console.error("Error in createNote controller", error);
        res.status(500).json({ message: "Internal server Error" });
    }
}

// --- GÜNCELLENMİŞ ve OPTİMİZE EDİLMİŞ updateNote FONKSİYONU ---
// backend/src/controllers/notesController.js

// backend/src/controllers/notesController.js
// !!! BU YÖNTEM TAVSİYE EDİLMEZ !!!

export async function updateNote(req, res) {
    try {
        const { title, content, subtitle } = req.body;
        const noteToUpdate = await Note.findById(req.params.id);

        if (!noteToUpdate) {
            return res.status(404).json({ message: "Note not found" });
        }

        if (req.file) {
            // Önce mevcut resmi sil
            if (noteToUpdate.image && noteToUpdate.image.public_id) {
                await cloudinary.uploader.destroy(noteToUpdate.image.public_id);
            }

            // --- DEĞİŞİKLİK: createNote'daki gibi manuel yükleme yapılıyor ---
            // Bu, resmi İKİNCİ KEZ yükler ve optimize eder.
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "notes",
                transformation: [
                    { width: 1200, height: 1200, crop: "limit" },
                    { quality: "auto:good", fetch_format: "auto" }
                ]
            });

            noteToUpdate.image = {
                url: result.secure_url,
                public_id: result.public_id
            };
        }

        noteToUpdate.title = title;
        noteToUpdate.content = content;
        noteToUpdate.subtitle = subtitle;

        const updatedNote = await noteToUpdate.save();
        res.status(200).json(updatedNote);
    } catch (error) {
        console.error("Error in updateNote controller", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// --- deleteNote FONKSİYONU aynı kalabilir ---
export async function deleteNote(req, res) {
    try {
        const noteToDelete = await Note.findById(req.params.id);

        if (!noteToDelete) {
            return res.status(404).json({ message: "Note not found" });
        }

        // Eğer notun bir resmi ve public_id'si varsa, Cloudinary'den sil
        // --- DÜZELTME BURADA ---
        if (noteToDelete.image && noteToDelete.image.public_id) {
            await cloudinary.uploader.destroy(noteToDelete.image.public_id);
        }
        // -------------------------

        // Notu veritabanından sil
        await Note.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Note deleted successfully" });
    } catch (error) {
        console.error("Error in deleteNote controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}