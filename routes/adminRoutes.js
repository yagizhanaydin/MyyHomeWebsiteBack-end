import express from "express";
import verifyToken, { isAdmin } from "../Middleware/AuthMiddleware.js";
import { 
  GetAdminCompanyData,
  ApproveCompany,
  DeleteCompany
} from "../controller/AdminController.js";

const router = express.Router();


router.get("/companylist", verifyToken, isAdmin, GetAdminCompanyData);


router.put("/company/:id/approve", verifyToken, isAdmin, ApproveCompany);


router.delete("/company/:id", verifyToken, isAdmin, DeleteCompany);

export default router;
