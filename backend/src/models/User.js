import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  name: { type: String, default: '' },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
}, { timestamps: true });

export default mongoose.model("User", userSchema);