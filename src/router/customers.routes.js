import { Router } from "express";
import CustomerControler from "../controllers/customers.controller.js";
import ValidateToken from "../middlewares/validationToken.js";
const router = Router()

router.post("/login-me", CustomerControler.LogIn)
router.post("/signup-me", CustomerControler.SignUp)
router.get("/getAllCustomers", CustomerControler.GetAllCustomers)
router.get("/getCustomer/:email", CustomerControler.getCustomerByEmail)
router.delete("/deleteCustomer/:Id", CustomerControler.Delete_Customer)
router.post("/logout", CustomerControler.Logout)
router.post("/forgotPassword/:email", CustomerControler.CreateOTP)
router.post("/verifyOTP/:email", CustomerControler.VerifyOTP)
router.post("/new-password/:email", CustomerControler.UpdatingPassword)
export default router;