import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import pool from '../database/DB.js';
import dotenv from 'dotenv';

dotenv.config(); // .env dosyasını yükle

// Multer ayarları
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

        const { fiyat, aciklama } = req.body;

    
        const images = req.files ? req.files.map(file => file.filename) : [];

      
        const result = await pool.query(
            `INSERT INTO homes (user_id, aciklama, fiyat, images) 
             VALUES ($1, $2, $3, $4) 
             RETURNING *`,
            [userId, aciklama, fiyat, images]
        );

        res.status(201).json({ message: "İlan eklendi", home: result.rows[0] });

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
