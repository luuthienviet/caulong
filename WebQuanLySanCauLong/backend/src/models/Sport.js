import mongoose from "mongoose";

const sportSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  icon: { type: String, default: "🎾" }
}, { timestamps: true });

export default mongoose.model("Sport", sportSchema);
