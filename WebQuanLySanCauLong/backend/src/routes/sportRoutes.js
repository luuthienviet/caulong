import express from "express";
import { getSports, getSportById, createSport, updateSport, deleteSport } from "../controllers/sportController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getSports);
router.get("/:id", getSportById);
router.post("/", authMiddleware, createSport);
router.put("/:id", authMiddleware, updateSport);
router.delete("/:id", authMiddleware, deleteSport);

export default router;
