import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  name: { type: String, default: '' },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin", "manager", "staff"], default: "user" },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  isLocked: { type: Boolean, default: false },
  shift: { type: String, default: '' },
  salary: { type: Number, default: 0 },
  status: { type: String, default: 'Hoạt động' },
  points: { type: Number, default: 0 }, // Tích điểm thành viên
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;