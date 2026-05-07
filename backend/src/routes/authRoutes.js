import express from "express";
import { register, login, forgotPassword, resetPassword, updateProfile, changePassword, getUsers, toggleUserLock } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/users", authMiddleware, adminMiddleware, getUsers);
router.put("/users/:id/lock", authMiddleware, adminMiddleware, toggleUserLock);
router.put("/profile", authMiddleware, updateProfile);
router.put("/change-password", authMiddleware, changePassword);

export default router;