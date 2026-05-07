import express from "express";
import {
  searchBookingsByPhone,
  getAllBookings,
  getUserBookings,
  createBooking,
  adminCreateBooking,
  updateBookingStatus,
  updateBookingPayment,
  deleteBooking
} from "../controllers/bookingController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public lookup theo số điện thoại
router.get("/search", searchBookingsByPhone);

// Tất cả routes đều yêu cầu auth
router.use(authMiddleware);

// Routes cho customer
router.get("/my-bookings", getUserBookings);
router.post("/", createBooking);
router.delete("/:id", deleteBooking);

// Routes cho admin
router.get("/", adminMiddleware, getAllBookings);
router.put("/:id/status", adminMiddleware, updateBookingStatus);
router.put("/:id/payment", adminMiddleware, updateBookingPayment);

// ✅ Admin đặt sân hộ khách
router.post("/admin-booking", adminMiddleware, adminCreateBooking);

export default router;