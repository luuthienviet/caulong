import express from "express";
import { getCourts, createCourt, updateCourt, deleteCourt } from "../controllers/courtController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public route: lấy danh sách sân (ai cũng xem được)
router.get("/", getCourts);

// Admin routes
router.post("/", authMiddleware, adminMiddleware, createCourt);
router.put("/:id", authMiddleware, adminMiddleware, updateCourt);
router.delete("/:id", authMiddleware, adminMiddleware, deleteCourt);

export default router;