import { Router } from "express";
import authController from "../controllers/authRefresh.controller.js";
 const router = Router()

router.post("/api", authController.RefreshPage)

export default router