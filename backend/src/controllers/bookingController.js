import Booking from "../models/Booking.js";
import User from "../models/User.js";
import { sendEmail } from "../utils/emailService.js";
import Notification from '../models/Notification.js';

const parseBookingStart = (booking) => {
  const rawDate = String(booking.date || '');
  const hour = String(booking.hour || '0').padStart(2, '0');
  const combined = `${rawDate}T${hour}:00:00`;
  const dateObj = new Date(combined);
  if (!isNaN(dateObj.getTime())) return dateObj;
  const segments = rawDate.split('/');
  if (segments.length === 3) {
    const [dd, mm, yyyy] = segments;
    const fallback = new Date(`${yyyy}-${mm}-${dd}T${hour}:00:00`);
    return isNaN(fallback.getTime()) ? null : fallback;
  }
  return null;
};

export const searchBookingsByPhone = async (req, res, next) => {
  try {
    const { phone } = req.query;
    if (!phone || typeof phone !== 'string') {
      return res.status(400).json({ success: true, data: [], message: 'Thiếu số điện thoại để tra cứu.' });
    }
    const cleanPhone = phone.trim();
    const user = await User.findOne({ phone: cleanPhone });
    if (!user) {
      return res.status(200).json({ success: true, data: [] });
    }
    const bookings = await Booking.find({ userId: user._id }).populate('userId', 'username name email phone');
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - 30);
    const filteredBookings = bookings.filter((booking) => {
      const start = parseBookingStart(booking);
      return !start || start >= threshold;
    });
    res.status(200).json({ success: true, data: filteredBookings });
  } catch (error) {
    next(error);
  }
};

export const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find().populate("userId", "username name email phone");
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
    if (req.user.role === 'admin') {
      return res.status(403).json({ message: "Admin không được phép đặt sân" });
    }

    const { courtId, courtName, date, hour, duration, total, paymentImage } = req.body;
    const userId = req.user.id;

    // ✅ FIX: Chặn cả approved lẫn pending — tránh 2 khách đặt cùng 1 khung giờ
    const existing = await Booking.findOne({
      courtId,
      date,
      hour,
      status: { $in: ['approved', 'pending'] }
    });

    if (existing) {
      const message = existing.status === 'approved'
        ? "Khung giờ này đã có người đặt và được duyệt. Vui lòng chọn giờ khác."
        : "Khung giờ này đang có người chờ duyệt. Vui lòng chọn giờ khác.";
      return res.status(400).json({ message });
    }

    const booking = await Booking.create({
      courtId, courtName, userId, date, hour, duration, total, paymentImage,
      status: 'pending'
    });

    const user = await User.findById(userId);
    const admin = await User.findOne({ role: 'admin' });

    if (admin?.email) {
      await sendEmail(
        admin.email,
        "Yêu cầu đặt sân mới",
        `<p>Khách <strong>${user.username}</strong> đặt sân <strong>${courtName}</strong> ngày <strong>${date}</strong> lúc <strong>${hour}:00</strong>. Vui lòng duyệt.</p>`
      );
    }
    if (user?.email) {
      await sendEmail(
        user.email,
        "Đặt sân thành công – Đang chờ duyệt",
        `<p>Yêu cầu đặt sân <strong>${courtName}</strong> ngày <strong>${date}</strong> lúc <strong>${hour}:00</strong> đã được gửi. Vui lòng chờ xác nhận từ quản trị viên.</p>`
      );
    }

    await Notification.create({
      userId,
      bookingId: booking._id,
      message: `Đơn #${booking._id} đã được gửi. Vui lòng chờ xác nhận.`,
      type: 'booking_created'
    });

    res.status(201).json({ success: true, data: booking });
  } catch (error) { next(error); }
};

export const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // ✅ Nếu admin duyệt (approved), kiểm tra xem khung giờ đó đã có booking approved chưa
    if (status === 'approved') {
      const booking = await Booking.findById(id);
      if (!booking) return res.status(404).json({ message: "Không tìm thấy đơn" });

      const conflict = await Booking.findOne({
        _id: { $ne: id },
        courtId: booking.courtId,
        date: booking.date,
        hour: booking.hour,
        status: 'approved'
      });

      if (conflict) {
        return res.status(400).json({
          message: `Khung giờ ${booking.hour}:00 ngày ${booking.date} của ${booking.courtName} đã được duyệt cho một đơn khác. Vui lòng từ chối đơn này.`
        });
      }
    }

    const booking = await Booking.findByIdAndUpdate(
      id, { status }, { new: true }
    ).populate('userId', 'username name email phone');

    if (!booking) return res.status(404).json({ message: "Không tìm thấy" });

    if (status === 'approved' || status === 'rejected') {
      let message = '';
      let typeValue = '';

      if (status === 'approved') {
        message = `✅ Đơn #${booking._id} đặt sân ${booking.courtName} ngày ${booking.date} lúc ${booking.hour}:00 đã được duyệt.`;
        typeValue = 'booking_approved';
      } else {
        message = `❌ Đơn #${booking._id} đặt sân ${booking.courtName} ngày ${booking.date} lúc ${booking.hour}:00 bị từ chối.`;
        typeValue = 'booking_rejected';
      }

      await Notification.create({
        userId: booking.userId._id,
        bookingId: booking._id,
        message,
        type: typeValue
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