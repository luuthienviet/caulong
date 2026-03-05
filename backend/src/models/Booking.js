const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  courtNumber: {
    type: Number,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  timeSlot: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'Đã đặt'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
