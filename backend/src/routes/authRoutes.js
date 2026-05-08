import { Router } from "express";
import { changePassword, login } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/login", login);
router.post("/change-password", authMiddleware, changePassword);

export default router;
