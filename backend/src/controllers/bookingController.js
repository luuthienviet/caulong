import Booking from "../models/Booking.js";
import User from "../models/User.js";
import { sendEmail } from "../utils/emailService.js";
import Notification from '../models/Notification.js';

export const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find().populate("userId", "username email");
    res.status(200).json({ success: true, data: bookings });
  } catch (error) { next(error); }
};

export const getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id }).populate('userId', 'username');
    res.status(200).json({ success: true, data: bookings });
  } catch (error) { next(error); }
};

export const createBooking = async (req, res, next) => {
  try {
    const { courtId, courtName, date, hour, duration, total, paymentImage } = req.body;
    const userId = req.user.id;
    const existing = await Booking.findOne({ courtId, date, hour, status: 'approved' });
    if (existing) return res.status(400).json({ message: "Khung giờ đã có người đặt" });
    const booking = await Booking.create({ courtId, courtName, userId, date, hour, duration, total, paymentImage, status: "pending" });
    const user = await User.findById(userId);
    const admin = await User.findOne({ role: 'admin' });
    if (admin && admin.email) {
      await sendEmail(admin.email, "Yêu cầu đặt sân mới", `<p>Khách ${user.username} đặt sân ${courtName} ngày ${date} lúc ${hour}:00. Vui lòng duyệt.</p>`);
    }
    if (user && user.email) {
      await sendEmail(user.email, "Đặt sân thành công", `<p>Yêu cầu của bạn đã được gửi, chờ duyệt.</p>`);
    }
    res.status(201).json({ success: true, data: booking });
  } catch (error) { next(error); }
};

export const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(id, { status }, { new: true }).populate('userId');
    if (!booking) return res.status(404).json({ message: "Không tìm thấy" });
    
    // Tạo thông báo cho khách hàng
    if (status === 'approved' || status === 'rejected') {
      let message = '';
      if (status === 'approved') {
        message = `✅ Đơn đặt sân ${booking.courtName} ngày ${booking.date} lúc ${booking.hour}:00 đã được duyệt.`;
      } else {
        message = `❌ Đơn đặt sân ${booking.courtName} ngày ${booking.date} lúc ${booking.hour}:00 bị từ chối.`;
      }
      await Notification.create({
        userId: booking.userId._id,
        message,
        type: status === 'approved' ? 'booking_approved' : 'booking_rejected'
      });
    }
    
    res.status(200).json({ success: true, data: booking });
  } catch (error) { next(error); }
};

export const deleteBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: "Không tìm thấy" });
    if (req.user.role !== "admin" && booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Không có quyền" });
    }
    if (req.user.role !== "admin" && booking.status !== "pending") {
      return res.status(400).json({ message: "Chỉ xóa khi chờ duyệt" });
    }
    await booking.deleteOne();
    res.status(200).json({ success: true, message: "Xóa thành công" });
  } catch (error) { next(error); }
};