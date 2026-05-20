import Booking from "../models/Booking.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { sendEmail } from "../utils/emailService.js";
import Notification from '../models/Notification.js';
import Court from "../models/Court.js";

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
    if (!user) return res.status(200).json({ success: true, data: [] });
    const bookings = await Booking.find({ userId: user._id }).populate('userId', 'username name email phone');
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - 30);
    const filteredBookings = bookings.filter((booking) => {
      const start = parseBookingStart(booking);
      return !start || start >= threshold;
    });
    res.status(200).json({ success: true, data: filteredBookings });
  } catch (error) { next(error); }
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

export const getAllSchedules = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ status: { $in: ['approved', 'pending'] } })
      .select("courtId courtName date hour duration status");
    res.status(200).json({ success: true, data: bookings });
  } catch (error) { next(error); }
};

export const createBooking = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      return res.status(403).json({ message: "Admin dùng route /admin-booking để đặt hộ khách" });
    }
    const {
      courtId,
      courtName,
      date,
      hour,
      duration,
      total,
      paymentImage,
      paymentMethod,
      customerName,
      customerPhone,
      customerNote,
      transferContent,
      paymentStatus
    } = req.body;
    const userId = req.user.id;
    
    // Kiểm tra trùng lặp khung giờ có tính đến thời lượng (duration)
    const existingBookings = await Booking.find({
      courtId,
      date,
      status: { $in: ['approved', 'pending'] }
    });
    
    const startProposed = parseInt(hour, 10);
    const endProposed = startProposed + parseInt(duration || 1, 10);
    
    const conflict = existingBookings.find(b => {
      const startExisting = parseInt(b.hour, 10);
      const endExisting = startExisting + (b.duration || 1);
      return startProposed < endExisting && startExisting < endProposed;
    });
    
    if (conflict) {
      const message = conflict.status === 'approved'
        ? `Khung giờ này đã trùng với lịch đã được duyệt (${conflict.hour}:00, thời lượng ${conflict.duration}h). Vui lòng chọn giờ khác.`
        : `Khung giờ này đang trùng với lịch chờ duyệt (${conflict.hour}:00, thời lượng ${conflict.duration}h). Vui lòng chọn giờ khác.`;
      return res.status(400).json({ message });
    }
    const booking = await Booking.create({
      courtId,
      courtName,
      userId,
      date,
      hour,
      duration,
      total,
      paymentImage,
      paymentMethod: paymentMethod || (paymentImage ? 'chuyển khoản cọc' : 'tại sân'),
      paymentStatus: paymentStatus || (paymentImage ? 'deposit_sent' : 'pending'),
      customerName,
      customerPhone,
      customerNote,
      transferContent,
      status: 'pending'
    });
    const user = await User.findById(userId);
    const admin = await User.findOne({ role: 'admin' });
    if (admin?.email) {
      sendEmail(admin.email, "Yêu cầu đặt sân mới",
        `<p>Khách <strong>${user.username}</strong> đặt sân <strong>${courtName}</strong> ngày <strong>${date}</strong> lúc <strong>${hour}:00</strong>. Vui lòng duyệt.</p>`
      ).catch(err => console.error('Email admin error:', err));
    }
    if (user?.email) {
      sendEmail(user.email, "Đặt sân thành công – Đang chờ duyệt",
        `<p>Yêu cầu đặt sân <strong>${courtName}</strong> ngày <strong>${date}</strong> lúc <strong>${hour}:00</strong> đã được gửi. Vui lòng chờ xác nhận.</p>`
      ).catch(err => console.error('Email user error:', err));
    }
    await Notification.create({ userId, bookingId: booking._id, message: `Đơn #${booking._id} đã được gửi. Vui lòng chờ xác nhận.`, type: 'booking_created' });
    res.status(201).json({ success: true, data: booking });
  } catch (error) { next(error); }
};

// ✅ ADMIN đặt sân hộ khách
export const adminCreateBooking = async (req, res, next) => {
  try {
    const {
      courtId,
      courtName,
      date,
      hour,
      duration,
      total,
      customerName,
      customerPhone,
      paymentMethod,
      status,
      paymentImage,
      paymentStatus,
      customerNote,
      transferContent
    } = req.body;
    if (!courtId || !courtName || !date || !hour || !customerName) {
      return res.status(400).json({ message: "Thiếu thông tin đặt sân" });
    }
    
    // Kiểm tra trùng lặp khung giờ có tính đến thời lượng (duration)
    const existingBookings = await Booking.find({
      courtId,
      date,
      status: { $in: ['approved', 'pending'] }
    });
    
    const startProposed = parseInt(hour, 10);
    const endProposed = startProposed + parseInt(duration || 1, 10);
    
    const conflict = existingBookings.find(b => {
      const startExisting = parseInt(b.hour, 10);
      const endExisting = startExisting + (b.duration || 1);
      return startProposed < endExisting && startExisting < endProposed;
    });
    
    if (conflict) {
      return res.status(400).json({ 
        message: `Khung giờ này trùng với lịch khác (${conflict.hour}:00, thời lượng ${conflict.duration}h).` 
      });
    }
    // Tự động tìm user theo username/phone/name
    let userId = req.user.id;
    let matchedUser = null;
    if (customerPhone) {
      matchedUser = await User.findOne({ phone: customerPhone });
    }
    if (!matchedUser && customerName) {
      matchedUser = await User.findOne({
        $or: [{ username: customerName }, { name: customerName }]
      });
    }
    if (matchedUser) {
      userId = matchedUser._id;
    } else if (customerName) {
      const guestUsername = `guest_${Date.now()}`;
      const randomPassword = Math.random().toString(36).slice(-8);
      const hash = await bcrypt.hash(randomPassword, 10);
      const userData = {
        username: guestUsername,
        name: customerName,
        password: hash,
        role: 'user',
        email: '',
        phone: customerPhone || ''
      };
      const newUser = new User(userData);
      await newUser.save();
      userId = newUser._id;
    }

    const booking = await Booking.create({
      courtId,
      courtName,
      userId,
      customerName,
      customerPhone,
      date,
      hour,
      duration: duration || 1,
      total: total || 0,
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: paymentStatus || 'paid',
      paymentImage,
      customerNote,
      transferContent,
      status: status || 'approved'
    });
    res.status(201).json({ success: true, data: booking });
  } catch (error) { next(error); }
};

export const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    if (status === 'approved') {
      const booking = await Booking.findById(id);
      if (!booking) return res.status(404).json({ message: "Không tìm thấy đơn" });
      
      const startProposed = parseInt(booking.hour, 10);
      const endProposed = startProposed + (booking.duration || 1);
      
      const existingBookings = await Booking.find({
        _id: { $ne: id },
        courtId: booking.courtId,
        date: booking.date,
        status: 'approved'
      });
      
      const conflict = existingBookings.find(b => {
        const startExisting = parseInt(b.hour, 10);
        const endExisting = startExisting + (b.duration || 1);
        return startProposed < endExisting && startExisting < endProposed;
      });
      
      if (conflict) {
        return res.status(400).json({ 
          message: `Không thể duyệt vì trùng khung giờ với đơn đã duyệt trước đó (${conflict.hour}:00, thời lượng ${conflict.duration}h).` 
        });
      }
    }
    const updatePayload = { status };
    if (status === 'rejected') {
      updatePayload.rejectReason = reason || "";
    }
    const booking = await Booking.findByIdAndUpdate(id, updatePayload, { new: true }).populate('userId', 'username name email phone');
    if (!booking) return res.status(404).json({ message: "Không tìm thấy" });
    if (status === 'approved' || status === 'rejected') {
      const message = status === 'approved'
        ? `✅ Đơn #${booking._id} đặt sân ${booking.courtName} ngày ${booking.date} lúc ${booking.hour}:00 đã được duyệt.`
        : `❌ Đơn #${booking._id} đặt sân ${booking.courtName} ngày ${booking.date} lúc ${booking.hour}:00 bị từ chối.${reason ? ` Lý do: ${reason}` : ''}`;
      const typeValue = status === 'approved' ? 'booking_approved' : 'booking_rejected';
      const notifUserId = booking.userId?._id || booking.userId;
      if (notifUserId) {
        await Notification.create({ userId: notifUserId, bookingId: booking._id, message, type: typeValue });
      }
    }
    res.status(200).json({ success: true, data: booking });
  } catch (error) { next(error); }
};
export const updateBookingPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paymentStatus, paymentMethod, paymentReceived } = req.body;
    const updateData = {};
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (paymentMethod) updateData.paymentMethod = paymentMethod;
    if (paymentReceived != null) updateData.paymentReceived = paymentReceived;

    const booking = await Booking.findByIdAndUpdate(id, updateData, { new: true }).populate('userId', 'username name email phone');
    if (!booking) return res.status(404).json({ message: "Không tìm thấy" });
    res.status(200).json({ success: true, data: booking });
  } catch (error) { next(error); }
};
export const deleteBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: "Không tìm thấy" });
    const isAdminRole = ["admin", "manager", "staff"].includes(req.user.role);
    if (!isAdminRole && booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Không có quyền" });
    }
    if (!isAdminRole && booking.status !== "pending") {
      return res.status(400).json({ message: "Chỉ xóa khi chờ duyệt" });
    }
    await booking.deleteOne();
    res.status(200).json({ success: true, message: "Xóa thành công" });
  } catch (error) { next(error); }
};

export const customerPayBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: "Không tìm thấy đơn đặt sân" });
    
    // Đảm bảo đúng user sở hữu booking này
    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Không có quyền thanh toán đơn này" });
    }
    
    // Đảm bảo đơn đã được duyệt sân trước
    if (booking.status !== 'approved') {
      return res.status(400).json({ message: "Đơn đặt sân chưa được duyệt bởi admin" });
    }
    
    // Cập nhật trạng thái thanh toán sang 'deposit_sent' và phương thức thanh toán sang 'transfer' (Chuyển khoản)
    booking.paymentStatus = 'deposit_sent';
    booking.paymentMethod = 'transfer';
    await booking.save();
    
    res.status(200).json({ success: true, message: "Gửi yêu cầu thanh toán thành công!", data: booking });
  } catch (error) { next(error); }
};

export const getAIRecommendations = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Lấy tất cả sân từ database
    const courts = await Court.find();
    const activeCourts = courts.filter(c => c.status !== 'Đang bảo trì');

    if (activeCourts.length === 0) {
      return res.status(200).json({
        success: true,
        type: 'none',
        message: 'Hiện tại tất cả các sân đều đang bảo trì.',
        court: null,
        date: '',
        hour: ''
      });
    }

    // 2. Lấy tất cả bookings đã duyệt để check trùng lịch
    const allSchedules = await Booking.find({ status: { $in: ['approved', 'pending'] } });

    // Khởi tạo ngày hôm nay và ngày mai định dạng YYYY-MM-DD (múi giờ Việt Nam GMT+7)
    const tzOffset = 7 * 60 * 60 * 1000;
    const localNow = new Date(Date.now() + tzOffset);
    const todayStr = localNow.toISOString().split('T')[0];

    const localTomorrow = new Date(Date.now() + tzOffset + 24 * 60 * 60 * 1000);
    const tomorrowStr = localTomorrow.toISOString().split('T')[0];

    const currentHour = localNow.getUTCHours(); // Giờ hiện tại sau khi đã cộng offset

    // Hàm kiểm tra xem khung giờ có trống và khả dụng không
    const isSlotAvailable = (courtId, date, hourStr, duration = 1) => {
      const hProposed = parseInt(hourStr, 10);
      
      // Nếu là ngày hôm nay và giờ đề xuất đã qua hoặc là giờ hiện tại (đặt sát quá)
      if (date === todayStr && hProposed <= currentHour) {
        return false;
      }
      
      const endProposed = hProposed + duration;

      const hasConflict = allSchedules.some(b => {
        if (b.status === 'rejected') return false;
        const isSameCourt = String(b.courtId) === String(courtId);
        if (!isSameCourt || b.date !== date) return false;
        
        const startExisting = parseInt(b.hour, 10);
        const endExisting = startExisting + (b.duration || 1);
        return hProposed < endExisting && startExisting < endProposed;
      });

      return !hasConflict;
    };

    // 3. Phân tích lịch sử đặt sân của user
    const userBookings = await Booking.find({ userId, status: 'approved' });

    if (userBookings.length > 0) {
      // Tìm sân được đặt nhiều nhất
      const courtCounts = {};
      const hourCounts = {};
      
      userBookings.forEach(b => {
        if (b.courtId) {
          courtCounts[b.courtId] = (courtCounts[b.courtId] || 0) + 1;
        }
        if (b.hour) {
          hourCounts[b.hour] = (hourCounts[b.hour] || 0) + 1;
        }
      });

      // Sắp xếp tìm sân yêu thích nhất
      const favoriteCourtId = Object.keys(courtCounts).reduce((a, b) => courtCounts[a] > courtCounts[b] ? a : b);
      const favoriteHour = Object.keys(hourCounts).reduce((a, b) => hourCounts[a] > hourCounts[b] ? a : b);

      const favCourt = activeCourts.find(c => String(c._id) === String(favoriteCourtId));

      if (favCourt) {
        // Kịch bản A: Sân yêu thích trống vào giờ quen thuộc ngày hôm nay
        if (isSlotAvailable(favoriteCourtId, todayStr, favoriteHour)) {
          return res.status(200).json({
            success: true,
            type: 'personalized',
            message: `🎯 AI nhận thấy sân yêu thích ${favCourt.name} đang trống vào khung giờ quen thuộc lúc ${favoriteHour}:00 hôm nay! Đặt ngay!`,
            court: favCourt,
            date: todayStr,
            hour: favoriteHour,
            reason: 'Khung giờ quen thuộc của bạn vẫn còn trống tối nay!'
          });
        }

        // Kịch bản B: Sân yêu thích trống vào giờ quen thuộc ngày mai
        if (isSlotAvailable(favoriteCourtId, tomorrowStr, favoriteHour)) {
          return res.status(200).json({
            success: true,
            type: 'personalized',
            message: `🎯 Khung giờ vàng quen thuộc ${favoriteHour}:00 ngày mai tại sân yêu thích ${favCourt.name} đang chờ bạn! Đăng ký ngay!`,
            court: favCourt,
            date: tomorrowStr,
            hour: favoriteHour,
            reason: 'Khung giờ bạn hay đặt nhất trống vào ngày mai!'
          });
        }

        // Kịch bản C: Tìm sân khác có trống vào giờ quen thuộc ngày hôm nay/ngày mai
        for (const dateStr of [todayStr, tomorrowStr]) {
          for (const court of activeCourts) {
            if (isSlotAvailable(court._id, dateStr, favoriteHour)) {
              return res.status(200).json({
                success: true,
                type: 'personalized',
                message: `🏸 Khung giờ quen thuộc ${favoriteHour}:00 của bạn hôm nay tại ${court.name} đang trống. Đặt ngay để không bỏ lỡ buổi tập!`,
                court: court,
                date: dateStr,
                hour: favoriteHour,
                reason: 'Khung giờ quen thuộc của bạn trống ở sân khác!'
              });
            }
          }
        }

        // Kịch bản D: Tìm sân yêu thích trống vào giờ lân cận (favoriteHour +/- 1, 2)
        const hourOffsets = [1, -1, 2, -2];
        for (const dateStr of [todayStr, tomorrowStr]) {
          for (const offset of hourOffsets) {
            const alternativeHour = parseInt(favoriteHour, 10) + offset;
            // Chỉ kiểm tra giờ mở cửa từ 5h đến 21h
            if (alternativeHour >= 5 && alternativeHour <= 21) {
              const altHourStr = String(alternativeHour).padStart(2, '0');
              if (isSlotAvailable(favoriteCourtId, dateStr, altHourStr)) {
                return res.status(200).json({
                  success: true,
                  type: 'personalized',
                  message: `💡 AI đề xuất: Sân yêu thích ${favCourt.name} trống lúc ${altHourStr}:00 (lệch ${Math.abs(offset)}h so với thói quen của bạn).`,
                  court: favCourt,
                  date: dateStr,
                  hour: altHourStr,
                  reason: 'Giờ lân cận trống tại sân bạn yêu thích nhất!'
                });
              }
            }
          }
        }
      }
    }

    // 4. Nếu không có lịch sử chơi hoặc không tìm thấy slot trống phù hợp hành vi,
    // gợi ý SÂN HOT NHẤT (Sân được đặt nhiều nhất hệ thống) vào khung giờ vàng
    const systemCourtCounts = {};
    const systemHourCounts = {};
    const allApprovedBookings = await Booking.find({ status: 'approved' });

    allApprovedBookings.forEach(b => {
      if (b.courtId) systemCourtCounts[b.courtId] = (systemCourtCounts[b.courtId] || 0) + 1;
      if (b.hour) systemHourCounts[b.hour] = (systemHourCounts[b.hour] || 0) + 1;
    });

    let trendingCourtId = Object.keys(systemCourtCounts).reduce((a, b) => systemCourtCounts[a] > systemCourtCounts[b] ? a : b, null);
    let trendingHour = Object.keys(systemHourCounts).reduce((a, b) => systemHourCounts[a] > systemHourCounts[b] ? a : b, '18');

    let trendingCourt = activeCourts.find(c => String(c._id) === String(trendingCourtId)) || activeCourts[0];

    // Khung giờ vàng đề xuất mặc định: 18, 19, 17, 20
    const primeHours = [trendingHour, '18', '19', '17', '20', '08', '09'];
    for (const dateStr of [todayStr, tomorrowStr]) {
      for (const court of activeCourts) {
        for (const pHour of primeHours) {
          const pHourStr = String(pHour).padStart(2, '0');
          if (isSlotAvailable(court._id, dateStr, pHourStr)) {
            const isToday = dateStr === todayStr;
            return res.status(200).json({
              success: true,
              type: 'trending',
              message: `🔥 Sân ${court.name} đang trống vào khung giờ vàng ${pHourStr}:00 ${isToday ? 'hôm nay' : 'ngày mai'}. Đặt sân trải nghiệm ngay!`,
              court: court,
              date: dateStr,
              hour: pHourStr,
              reason: 'Sân trống vào khung giờ vàng được yêu thích nhất hệ thống!'
            });
          }
        }
      }
    }

    // Fallback cuối cùng: Chọn bất kỳ giờ nào trống của sân đầu tiên
    const allHours = ['18', '19', '17', '20', '08', '09', '15', '16', '06', '07'];
    for (const dateStr of [todayStr, tomorrowStr]) {
      for (const court of activeCourts) {
        for (const h of allHours) {
          const hStr = String(h).padStart(2, '0');
          if (isSlotAvailable(court._id, dateStr, hStr)) {
            return res.status(200).json({
              success: true,
              type: 'trending',
              message: `🏸 Trải nghiệm ngay sân ${court.name} vào lúc ${hStr}:00 ${dateStr === todayStr ? 'tối nay' : 'ngày mai'}! Lên sân luyện tập nào!`,
              court: court,
              date: dateStr,
              hour: hStr,
              reason: 'Sân trống có sẵn dành cho bạn!'
            });
          }
        }
      }
    }

    // Nếu thực sự không còn bất kỳ slot trống nào
    return res.status(200).json({
      success: true,
      type: 'none',
      message: 'Xin lỗi bạn! Tất cả các sân và khung giờ trong 2 ngày tới đã kín lịch. Vui lòng quay lại sau.',
      court: null,
      date: '',
      hour: ''
    });

  } catch (error) {
    next(error);
  }
};