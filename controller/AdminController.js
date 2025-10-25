import pool from "../database/DB.js";
import path from "path";

export const GetAdminCompanyData = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM companies ORDER BY kayit_tarihi DESC");

    // Belgelerin tam URL'lerini oluştur (örneğin jpg, png dosyaları)
    const dataWithFiles = result.rows.map((company) => {
      const belgeList = company.belge_yolu
        ? company.belge_yolu.split(",").map((file) => `http://localhost:3000/companyuploads/${file}`)
        : [];

      return {
        ...company,
        belgeler: belgeList,
      };
    });

    res.status(200).json(dataWithFiles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Şirket verileri alınamadı!" });
  }
};
