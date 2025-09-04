// backend/src/server.js

import express from 'express';
import notesRoutes from "./routes/noteRoutes.js";
import { connectDB } from './config/db.js';
import dotenv from "dotenv";
import rateLimiter from './middleware/rateLimiter.js';
import cors from 'cors';

dotenv.config();

const app = express();

connectDB(); // Veritabanı bağlantısını başlat

app.use(express.json());

// DEĞİŞTİRİLDİ: CORS Ayarı
// Vercel'de frontend'in adresi localhost olmayacağı için,
// backend'in her yerden gelen isteklere cevap vermesine izin veriyoruz.
app.use(cors());

app.use(rateLimiter);

// KALDIRILDI: Bu satıra artık gerek yok çünkü fotoğraflar Cloudinary'de
// app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use("/api/notes", notesRoutes);


// KALDIRILDI: Vercel sunucuyu kendisi dinleyeceği için bu bloğu tamamen siliyoruz.
/*
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log('Server started on PORT :', PORT);
  });
});
*/

// EKLENDİ: Vercel'in uygulamayı çalıştırabilmesi için app nesnesini dışa aktarıyoruz.
export default app;