import ProductController from "../controllers/product.controller.js";
import { upload } from "../config/multer.js";
import ValidateToken from "../middlewares/validationToken.js";
import { Router } from "express";
const router = Router();

router.post("/", ValidateToken, upload.array("Img_url"), ProductController.Create_Product)
router.put("/:uuid", upload.array("Img_url"), ProductController.Update_Product)
router.get("/getAll", ProductController.GetAll_Product)
router.get("/:uuid", ProductController.Get_ProductById)
router.get("/slug/:slug", ProductController.findProduct)
router.put("/deleteProduct/:uuid", ProductController.DeleteProduct)

export default router; 