import { Router } from "express";
import CustomerControlerProfile from "../controllers/profile.controller.js";

const router = Router()

router.post("/customer/edite-profile/:email", CustomerControlerProfile.UpdatingProfile)

export default router;