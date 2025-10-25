import express from "express";
import verifyToken, { isAdmin } from "../Middleware/AuthMiddleware.js";
import { GetAdminCompanyData } from "../controller/AdminController.js";

const router = express.Router();

// 🔒 sadece adminler erişebilir
router.get("/companylist", verifyToken, isAdmin, GetAdminCompanyData);

export default router;
