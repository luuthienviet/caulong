import express from "express";
import {
  searchBookingsByPhone,
  getAllBookings,
  getUserBookings,
  createBooking,
  adminCreateBooking,
  updateBookingStatus,
  updateBookingPayment,
  deleteBooking,
  customerPayBooking,
  getAllSchedules,
  getAIRecommendations
} from "../controllers/bookingController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public lookup theo số điện thoại và lịch đặt sân
router.get("/search", searchBookingsByPhone);
router.get("/all-schedules", getAllSchedules);

// Tất cả routes đều yêu cầu auth
router.use(authMiddleware);

// Routes cho customer
router.get("/ai-recommendations", getAIRecommendations);
router.get("/my-bookings", getUserBookings);
router.post("/", createBooking);
router.delete("/:id", deleteBooking);
router.put("/:id/pay", customerPayBooking);

// Routes cho admin
router.get("/", adminMiddleware, getAllBookings);
router.put("/:id/status", adminMiddleware, updateBookingStatus);
router.put("/:id/payment", adminMiddleware, updateBookingPayment);

// ✅ Admin đặt sân hộ khách
router.post("/admin-booking", adminMiddleware, adminCreateBooking);

export default router;