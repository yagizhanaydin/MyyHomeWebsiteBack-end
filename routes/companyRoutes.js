import express from "express";
import { RegisterCompany, uploadCompanyFiles } from "../controller/CompanyController.js";

const router = express.Router();

router.post("/register", uploadCompanyFiles, RegisterCompany);

export default router;
