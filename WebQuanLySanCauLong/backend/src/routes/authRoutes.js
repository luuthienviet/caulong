import express from "express";
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
  getUsers,
  toggleUserLock,
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  getMe
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/users", authMiddleware, adminMiddleware, getUsers);
router.put("/users/:id/lock", authMiddleware, adminMiddleware, toggleUserLock);
router.get("/me", authMiddleware, getMe);
router.put("/profile", authMiddleware, updateProfile);
router.put("/change-password", authMiddleware, changePassword);

// Staff routes
router.get("/staff", authMiddleware, adminMiddleware, getStaff);
router.post("/staff", authMiddleware, adminMiddleware, createStaff);
router.put("/staff/:id", authMiddleware, adminMiddleware, updateStaff);
router.delete("/staff/:id", authMiddleware, adminMiddleware, deleteStaff);

export default router;