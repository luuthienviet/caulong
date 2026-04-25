import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  courtId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Court",
    required: true
  },
  courtName: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  date: {
    type: String,
    required: true
  },
  hour: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 1
  },
  total: {
    type: Number,
    required: true
  },
  paymentImage: {
    type: String
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  }
}, { timestamps: true });

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;