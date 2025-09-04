// backend/src/controllers/notesController.js

import Note from "../models/Note.js";
import { v2 as cloudinary } from 'cloudinary'; // Cloudinary'yi import ediyoruz, fs ve path'e gerek kalmadı.

// Bu iki fonksiyonda bir değişiklik yok, aynı kalabilir.
export async function getAllowNotes(_, res) {
    try {
        const notes = await Note.find().sort({ createdAt: -1 }); // createAt -> createdAt olarak düzeltildi (genellikle böyledir)
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

// --- GÜNCELLENMİŞ createNote FONKSİYONU ---
export async function createNote(req, res) {
    try {
        const { title, content } = req.body;
        const newNote = new Note({ title, content });

        // Eğer bir dosya yüklendiyse (yani Cloudinary'ye gönderildiyse),
        // Cloudinary'den gelen URL ve public_id bilgilerini veritabanına kaydediyoruz.
        if (req.file) {
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

// --- GÜNCELLENMİŞ updateNote FONKSİYONU ---
export async function updateNote(req, res) {
    try {
        const { title, content } = req.body;
        const noteToUpdate = await Note.findById(req.params.id);

        if (!noteToUpdate) {
            return res.status(404).json({ message: "Note not found" });
        }

        // Eğer kullanıcı yeni bir fotoğraf yüklediyse...
        if (req.file) {
            // ...ve notun eski bir fotoğrafı varsa, önce onu Cloudinary'den siliyoruz.
            if (noteToUpdate.image && noteToUpdate.image.public_id) {
                await cloudinary.uploader.destroy(noteToUpdate.image.public_id);
            }

            // Sonra notun image alanını yeni fotoğrafın bilgileriyle güncelliyoruz.
            noteToUpdate.image = {
                url: req.file.path,
                public_id: req.file.filename
            };
        }

        // Diğer alanları (title, content) güncelliyoruz.
        noteToUpdate.title = title;
        noteToUpdate.content = content;

        const updatedNote = await noteToUpdate.save();
        res.status(200).json(updatedNote);
    } catch (error) {
        console.error("Error in updateNote controller", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// --- GÜNCELLENMİŞ deleteNote FONKSİYONU ---
export async function deleteNote(req, res) {
    try {
        const noteToDelete = await Note.findById(req.params.id);

        if (!noteToDelete) {
            return res.status(404).json({ message: "Note not found" });
        }

        // Notu veritabanından silmeden önce, eğer bir fotoğrafı varsa,
        // bu fotoğrafı Cloudinary'den siliyoruz.
        if (noteToDelete.image && noteToDelete.image.public_id) {
            await cloudinary.uploader.destroy(noteToDelete.image.public_id);
        }

        // Fotoğraf silindikten sonra notu MongoDB'den siliyoruz.
        await Note.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Note deleted successfully" });
    } catch (error) {
        console.error("Error in deleteNote controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}