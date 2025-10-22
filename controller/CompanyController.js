import multer from "multer";
import path from "path";
import fs from "fs";
import bcrypt from "bcrypt";
import pool from "../database/DB.js";

const uploadDir = "companyuploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });


export const uploadCompanyFiles = upload.array("belgeler", 5); 

export const RegisterCompany = async (req, res) => {
  try {
    console.log("---- Gelen request ----");
    console.log("req.body:", req.body);      
    console.log("req.files:", req.files);    

    const { company_name, phone_number, password, confirmPassword } = req.body;
    const belgeler = req.files; 

    if (!company_name || !phone_number || !password || !confirmPassword)
      return res.status(400).json({ message: "Tüm alanlar doldurulmalı!" });

    if (!belgeler || belgeler.length === 0)
      return res.status(400).json({ message: "Belge yüklenmedi!" });

    if (password !== confirmPassword)
      return res.status(400).json({ message: "Şifreler uyuşmuyor!" });

    const checkPhone = await pool.query(
      "SELECT * FROM companies WHERE phone_number = $1",
      [phone_number]
    );
    if (checkPhone.rows.length > 0)
      return res.status(400).json({ message: "Bu telefon numarası zaten kayıtlı!" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const belgeFilenames = belgeler.map((b) => b.filename).join(",");

    await pool.query(
      "INSERT INTO companies (company_name, phone_number, password, belge_yolu, kayit_tarihi) VALUES ($1, $2, $3, $4, NOW())",
      [company_name, phone_number, hashedPassword, belgeFilenames]
    );

    return res.status(200).json({
      message: "Şirket kaydı ve belgeler yükleme başarılı!",
      belgeler: belgeFilenames,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Sunucu hatası!" });
  }
};
