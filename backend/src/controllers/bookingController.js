const Booking = require('../models/Booking');

/* GET all bookings */
exports.getBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find();
    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

/* CREATE booking */
exports.createBooking = async (req, res, next) => {
  try {
    const booking = await Booking.create(req.body);
    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};
