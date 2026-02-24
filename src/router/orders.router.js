import { Router } from "express";
import OrdersController from "../controllers/orders.controller.js";
const router = Router()

router.post("/ordered/create", OrdersController.AddOrders)
router.get("/getAll", OrdersController.GetAllOrders)
router.get("/getUnique/:OrderID", OrdersController.GetOrderByID)
router.get("/getDaily", OrdersController.GetDailyOrders)
router.get("/getYearly", OrdersController.GetYearsOrdersSales)
router.put("/updateStatus", OrdersController.UpdateOrders)
router.get("/getCustomer/orders", OrdersController.GetCustomerOrders)

export default router