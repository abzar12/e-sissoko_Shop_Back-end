import PaymentVerify from "../controllers/payment.controller.js";
import { Router } from "express";

const router = Router()

router.get("/verify/:reference", PaymentVerify.Verification)
router.post("/paystack", PaymentVerify.WebhookPaystack)

export default router