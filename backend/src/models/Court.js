const mongoose = require('mongoose');

const courtSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  pricePerHour: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'maintenance'],
    default: 'available'
  }
}, { timestamps: true });

module.exports = mongoose.model('Court', courtSchema);
