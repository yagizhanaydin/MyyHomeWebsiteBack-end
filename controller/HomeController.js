import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import pool from '../database/DB.js';
import dotenv from 'dotenv';

dotenv.config(); 


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, `${name}-${uniqueSuffix}${ext}`);
    }
});

export const upload = multer({ storage });

export const AddHome = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Token bulunamadı" });

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const userId = decoded.userId;

    const {
      il,
      ilce,
      adres,
      numara,      
      odaSayisi,
      brutMetrekare, 
      netMetrekare,  
      fiyat,
      aciklama,
    } = req.body;

    const images = req.files ? req.files.map((file) => file.filename) : [];

    if (!il || !ilce || !adres || !odaSayisi || !brutMetrekare || !netMetrekare || !fiyat || !aciklama) {
      return res.status(400).json({ message: "Tüm alanlar doldurulmalıdır" });
    }

    const result = await pool.query(
      `INSERT INTO homes 
      (user_id, il, ilce, adres, numara, oda_sayisi, brut_metrekare, net_metrekare, fiyat, aciklama, images)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::text[])
       RETURNING *`,
      [userId, il, ilce, adres, numara, odaSayisi, brutMetrekare, netMetrekare, fiyat, aciklama, images]
    );

    res.status(201).json({
      message: "İlan başarıyla eklendi",
      home: result.rows[0],
    });
  } catch (error) {
    console.error("AddHome hatası:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Geçersiz token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token süresi dolmuş" });
    }

    res.status(500).json({ message: "Bir hata oluştu", error });
  }
};


export const GetHomes = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM homes ORDER BY created_at DESC');
    res.status(200).json({ homes: result.rows });
  } catch (error) {
    console.error("GetHomes hatası:", error);
    res.status(500).json({ message: "Bir hata oluştu", error });
  }
};



export const GetDetailHomes = async (req, res) => {
  const { id } = req.params; 

  try {
    const result = await pool.query("SELECT * FROM homes WHERE id = $1", [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "İlan bulunamadı" });
    }

    const home = result.rows[0];

   
    if (!home.images) {
      home.images = [];
    } else if (typeof home.images === 'string') {
   
      home.images = home.images.split(',');
    }
   

    res.json({ home });
  } catch (error) {
    console.error("İlan detay çekilirken hata:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};