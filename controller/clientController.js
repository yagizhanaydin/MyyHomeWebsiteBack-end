
import pool from '../database/DB.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { sendVerificationMail } from '../services/nodemailer.js';
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'


export const register = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Eksik alan" });

  try {
  
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

  
    const token = crypto.randomBytes(32).toString('hex');

    await pool.query(
      'INSERT INTO users (email, password, verification_token, is_verified) VALUES ($1, $2, $3, FALSE)',
      [email, hashedPassword, token]
    );

    await sendVerificationMail(email, "Kullanıcı", token);

    res.status(200).json({ message: "Kayıt başarılı, doğrulama maili gönderildi." });
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      return res.status(400).json({ message: "Bu email zaten kayıtlı." });
    }
    res.status(500).json({ message: "Kayıt sırasında hata oluştu" });
  }
};


export const verify = async (req, res) => {
  const { token } = req.query;
  console.log("Verify token geldi:", token);

  try {
    const result = await pool.query(
      'UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE verification_token = $1 RETURNING *',
      [token]
    );

    if (result.rowCount === 0) {
      console.log("Token bulunamadı veya zaten kullanılmış");
      return res.status(400).send("Geçersiz veya kullanılmış token");
    }

    console.log("Doğrulama başarılı:", result.rows[0]);
    res.send("Mail doğrulandı, artık giriş yapabilirsin!");
  } catch (err) {
    console.error("Verify hatası:", err);
    res.status(500).send("Doğrulama sırasında hata oluştu");
  }
};





export const Clientlogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Eksik alan" });
  }

  try {
    // Kullanıcıyı email ile bul
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rowCount === 0) {
      return res.status(400).json({ message: "Kullanıcı bulunamadı" });
    }

    const user = result.rows[0];

    // Şifreyi doğrula
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Şifre hatalı" });
    }

    // Mail doğrulama kontrolü
    if (!user.is_verified) {
      return res.status(403).json({ message: "Mail doğrulanmamış" });
    }

    // JWT token oluştur
    const token = jwt.sign(
      { userId: user.id, email: user.email }, // payload
      process.env.SECRET_KEY,               // .env'den al
      { expiresIn: '1h' }
    );

    // Başarılı yanıt
    res.status(200).json({ message: "Giriş başarılı", token });

  } catch (err) {
    console.error("Login hatası:", err);
    res.status(500).json({ message: "Login sırasında hata oluştu" });
  }
};