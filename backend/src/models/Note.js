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
        // subtitle alanı required: false olarak ayarlandığı için zorunlu değildir.
        subtitle: {
            type: String,
            required: false 
        },
        image: {
            url: String, // Fotoğrafın Cloudinary'deki tam adresi
            public_id: String // Fotoğrafı silmek için gereken benzersiz kimlik
        },
    },
    { timestamps: true }
);

const Note = mongoose.model("Note", noteSchema);
export default Note;