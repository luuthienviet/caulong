import mongoose from "mongoose";

const courtSchema = new mongoose.Schema({
  avgRating: { type: Number, default: 0 },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  image: { type: String },
  status: { type: String, enum: ["Trống", "Đang sử dụng", "Đang bảo trì"], default: "Trống" },
  reviewCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("Court", courtSchema);