import pool from "../database/DB.js";
import path from "path";

export const GetAdminCompanyData = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM companies ORDER BY kayit_tarihi DESC");

   
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



export const ApproveCompany = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "UPDATE companies SET onay_durumu = 'onaylandı' WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Şirket bulunamadı" });
    }
    res.status(200).json({ message: "Şirket onaylandı", company: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Onaylama hatası" });
  }
};




export const DeleteCompany = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM companies WHERE id = $1", [id]);
    res.status(200).json({ message: "Şirket silindi!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Silme işlemi başarısız!" });
  }
};
