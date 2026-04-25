import express from "express";
import {
  getAllBookings,
  getUserBookings,
  createBooking,
  updateBookingStatus,
  deleteBooking
} from "../controllers/bookingController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Tất cả routes đều yêu cầu auth
router.use(authMiddleware);

// Routes cho customer
router.get("/my-bookings", getUserBookings);
router.post("/", createBooking);
router.delete("/:id", deleteBooking);

// Routes cho admin
router.get("/", adminMiddleware, getAllBookings);
router.put("/:id/status", adminMiddleware, updateBookingStatus);

export default router;