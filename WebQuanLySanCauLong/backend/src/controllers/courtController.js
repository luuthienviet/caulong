import Court from "../models/Court.js";
import Booking from "../models/Booking.js";

// Lấy tất cả sân
export const getCourts = async (req, res, next) => {
  try {
    const courts = await Court.find();
    
    // Tính số lượng booking đã được duyệt cho mỗi sân
    const courtsWithBookings = await Promise.all(courts.map(async (court) => {
      const bookingCount = await Booking.countDocuments({ 
        courtId: court._id.toString(),
        status: 'approved' 
      });
      return {
        ...court.toObject(),
        bookingCount
      };
    }));
    
    res.status(200).json({ success: true, data: courtsWithBookings });
  } catch (error) {
    next(error);
  }
};

// Tạo sân mới (admin)
export const createCourt = async (req, res, next) => {
  try {
    const court = await Court.create(req.body);
    res.status(201).json({ success: true, data: court });
  } catch (error) {
    next(error);
  }
};

// Cập nhật sân (admin)
export const updateCourt = async (req, res, next) => {
  try {
    const court = await Court.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!court) return res.status(404).json({ message: "Không tìm thấy sân" });
    res.status(200).json({ success: true, data: court });
  } catch (error) {
    next(error);
  }
};

// Xóa sân (admin)
export const deleteCourt = async (req, res, next) => {
  try {
    const court = await Court.findByIdAndDelete(req.params.id);
    if (!court) return res.status(404).json({ message: "Không tìm thấy sân" });
    res.status(200).json({ success: true, message: "Xóa thành công" });
  } catch (error) {
    next(error);
  }
};