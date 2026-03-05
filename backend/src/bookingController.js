const Booking = require('../models/Booking');

// Đặt sân
exports.createBooking = async (req, res, next) => {
  try {
    const booking = await Booking.create(req.body);
    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
};

// Xem lịch đặt
exports.getBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find();
    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }

  exports.getBookings = async (req, res) => {
  const bookings = await Booking.find();
  res.json(bookings);
};

};
