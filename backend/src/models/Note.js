// backend/src/models/Note.js

import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true
        },
        // --- BU BÖLÜMÜ DEĞİŞTİR ---
        image: {
            url: String, // Fotoğrafın Cloudinary'deki tam adresi
            public_id: String // Fotoğrafı silmek için gereken benzersiz kimlik
        },
        // --- DEĞİŞİKLİK SONU ---
    },
    { timestamps: true }
);

const Note = mongoose.model("Note", noteSchema);
export default Note;