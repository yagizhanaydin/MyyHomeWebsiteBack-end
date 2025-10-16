// controller/clientController.js
import pool from '../database/DB.js';
import crypto from 'crypto';
import { sendVerificationMail } from '../services/nodemailer.js';

export const register = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Eksik alan" });

  try {
    const token = crypto.randomBytes(32).toString('hex');

    await pool.query(
      'INSERT INTO users (email, password, verification_token, is_verified) VALUES ($1, $2, $3, FALSE)',
      [email, password, token]
    );

    // Backend linki ile mail gönder
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
