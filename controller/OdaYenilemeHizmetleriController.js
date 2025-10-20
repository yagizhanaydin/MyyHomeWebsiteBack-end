import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import pool from '../database/DB.js';
import dotenv from 'dotenv';

dotenv.config();

// Multer ayarları
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Fotoğraflar uploads klasörüne kaydedilecek
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

export const upload = multer({ storage });


export const AddOdaYenileme = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Token bulunamadı" });

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const userId = decoded.userId;

    let { il, ilce, odaTurleri, odaSayisi, aciklama } = req.body;

    // FormData ile array tek gelirse string oluyor
    if (!odaTurleri) return res.status(400).json({ message: "Oda türleri eksik" });
    if (!Array.isArray(odaTurleri)) odaTurleri = [odaTurleri];

    if (!il || !ilce || !odaSayisi || !aciklama) {
      return res.status(400).json({ message: "Tüm alanlar doldurulmalıdır" });
    }

    const fotolar = req.files ? req.files.map(file => file.filename) : [];

    const result = await pool.query(
      `INSERT INTO oda_yenileme 
         (user_id, il, ilce, oda_turleri, oda_sayisi, aciklama, fotolar)
       VALUES ($1,$2,$3,$4,$5,$6,$7::text[])
       RETURNING *`,
      [userId, il, ilce, odaTurleri, odaSayisi, aciklama, fotolar]
    );

    res.status(201).json({
      message: "Oda yenileme talebi başarıyla eklendi",
      odaYenileme: result.rows[0],
    });

  } catch (error) {
    console.error("AddOdaYenileme hatası:", error);
    res.status(500).json({ message: "Bir hata oluştu", error });
  }
};


export const GetOdaYenileme = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM oda_yenileme ORDER BY created_at DESC');
    res.status(200).json({ odaYenilemeler: result.rows });
  } catch (error) {
    console.error("GetOdaYenileme hatası:", error);
    res.status(500).json({ message: "Bir hata oluştu", error });
  }
};


export const GetOdaYenilemeDetail = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("SELECT * FROM oda_yenileme WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Oda yenileme talebi bulunamadı" });
    }

    const oda = result.rows[0];

    if (!oda.fotolar) {
      oda.fotolar = [];
    } else if (typeof oda.fotolar === 'string') {
      oda.fotolar = oda.fotolar.split(',');
    }

    res.json({ oda });
  } catch (error) {
    console.error("Oda detay çekilirken hata:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};
