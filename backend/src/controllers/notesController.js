// backend/src/controllers/notesController.js

import Note from "../models/Note.js";
import { v2 as cloudinary } from 'cloudinary';

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

// --- GÜNCELLENMİŞ createNote FONKSİYONU (Cloudinary optimizasyon parametreleri eklendi) ---
export async function createNote(req, res) {
    try {
        const { title, content } = req.body;
        const newNote = new Note({ title, content });

        if (req.file) {
            // Cloudinary'ye yükleme yaparken optimizasyon parametrelerini ekliyoruz.
            // Bu parametreler Cloudinary'nin en iyi sıkıştırma ve formatı seçmesini sağlar.
            // quality: 'auto:good' -> iyi kaliteyi hedeflerken sıkıştırma uygula
            // fetch_format: 'auto' -> tarayıcının desteklediği en iyi formatı kullan (WebP, AVIF vb.)
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "notes", // Cloudinary'de notlar için bir klasör oluştur
                quality: 'auto:good', // Kaliteyi otomatik olarak optimize et
                fetch_format: 'auto', // En iyi dosya formatını otomatik seç (WebP, AVIF vb.)
                crop: "fill", // Gerekirse resmi kırp ve doldur
                width: 800, // Genişliği belirle, yüksekliği oranla ayarlar
                height: 600, // Yüksekliği belirle, genişliği oranla ayarlar
            });

            newNote.image = {
                url: result.secure_url, // Güvenli URL'yi kullan
                public_id: result.public_id
            };
        }

        const savedNote = await newNote.save();
        res.status(201).json(savedNote);
    } catch (error) {
        console.error("Error in createNote controller", error);
        res.status(500).json({ message: "Internal server Error" });
    }
}

// --- GÜNCELLENMİŞ updateNote FONKSİYONU (Cloudinary optimizasyon parametreleri eklendi) ---
export async function updateNote(req, res) {
    try {
        const { title, content } = req.body;
        const noteToUpdate = await Note.findById(req.params.id);

        if (!noteToUpdate) {
            return res.status(404).json({ message: "Note not found" });
        }

        if (req.file) {
            // Eski fotoğrafı sil
            if (noteToUpdate.image && noteToUpdate.image.public_id) {
                await cloudinary.uploader.destroy(noteToUpdate.image.public_id);
            }

            // Yeni fotoğrafı optimize edilmiş şekilde yükle
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "notes",
                quality: 'auto:good',
                fetch_format: 'auto',
                crop: "fill",
                width: 800,
                height: 600,
            });

            noteToUpdate.image = {
                url: result.secure_url,
                public_id: result.public_id
            };
        }

        noteToUpdate.title = title;
        noteToUpdate.content = content;

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

        if (noteToDelete.image && noteToDelete.image.public_id) {
            await cloudinary.uploader.destroy(noteToDelete.image.public_id);
        }

        await Note.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Note deleted successfully" });
    } catch (error) {
        console.error("Error in deleteNote controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}