// backend/server.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import multer from 'multer'; // multer'ı buraya da import etmeyi unutmayın

import notesRoutes from "./routes/noteRoutes.js";
import { connectDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

// Production ortamında IP adresinin doğru okunması için (ÖNEMLİ)
app.set('trust proxy', 1); 

// middleware
if (process.env.NODE_ENV !== "production") {
  app.use(
    cors({
      origin: "http://localhost:5173",
    })
  );
}
app.use(express.json());

// --- ÖNERİ: Rate Limiter'ı sadece API rotalarına uygulayın ---
app.use("/api", rateLimiter);
app.use("/api/notes", notesRoutes);
// -----------------------------------------------------------

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

// --- YENİ: MULTER HATA YAKALAMA MIDDLEWARE'İ ---
// Bu kod bloğunu rotalarınızdan SONRA, veritabanı bağlantısından ÖNCE ekleyin.
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            // Büyük dosya hatasını yakalayıp anlaşılır bir JSON mesajı döner.
            return res.status(400).json({
                message: 'Dosya boyutu çok büyük. Lütfen 5MB\'dan daha küçük bir fotoğraf yükleyin.',
            });
        }
    }
    // Diğer sunucu hatalarını da yakalamak için
    res.status(500).json({ message: error.message || 'Bir sunucu hatası oluştu.' });
});
// ----------------------------------------------------

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server started on PORT:", PORT);
  });
});