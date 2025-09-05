// backend/src/controllers/notesController.js

import Note from "../models/Note.js";
import { v2 as cloudinary } from 'cloudinary';

// getAllowNotes ve getNoteById fonksiyonları aynı kalabilir...

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
        const { title, content,subtitle } = req.body;
        const newNote = new Note({ title, content,subtitle });

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "notes",
                // Yeniden boyutlandırma ve optimizasyon parametreleri bir arada
                transformation: [
                    { width: 1200, height: 1200, crop: "limit" }, // En-boy oranını koruyarak resmi 1200x1200 alanına sığdırır
                    { quality: "auto:good", fetch_format: "auto" }
                ]
            });

            newNote.image = {
                url: result.secure_url,
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

// --- GÜNCELLENMİŞ ve OPTİMİZE EDİLMİŞ updateNote FONKSİYONU ---
export async function updateNote(req, res) {
    try {
        const { title, content,subtitle } = req.body;
        const noteToUpdate = await Note.findById(req.params.id);

        if (!noteToUpdate) {
            return res.status(404).json({ message: "Note not found" });
        }

        if (req.file) {
            if (noteToUpdate.image && noteToUpdate.image.public_id) {
                await cloudinary.uploader.destroy(noteToUpdate.image.public_id);
            }

            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "notes",
                 // Yeniden boyutlandırma ve optimizasyon parametreleri bir arada
                 transformation: [
                    { width: 1200, height: 1200, crop: "limit" }, // En-boy oranını koruyarak resmi 1200x1200 alanına sığdırır
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

        if (noteToDelete.image && noteToUpdate.image.public_id) {
            await cloudinary.uploader.destroy(noteToUpdate.image.public_id);
        }

        await Note.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Note deleted successfully" });
    } catch (error) {
        console.error("Error in deleteNote controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}