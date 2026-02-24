import UserController from "../controllers/user.controllers.js";
import { Router } from "express";

const router = Router();

router.get('/user/:Id', UserController.Get_UserById)
router.get('/:email', UserController.getUserByEmail)
router.post('/', UserController.Add_User);
router.delete('/deleteUsers/:Id', UserController.Delete_User);
router.post('/login-me', UserController.logIn)
router.get('/getAllUsers/', UserController.GetAllUser)
export default router;