import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./src/models/User.js";

dotenv.config();

const mongoUri =
  process.env.MONGO_URI ||
  process.env.MONGO_FALLBACK_URI ||
  "mongodb://127.0.0.1:27017/WebQuanLySanCauLong";

const updatePassword = async () => {
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
    const user = await User.findOne({ username: "vin" });
    if (!user) {
      console.log("User 'vin' không tồn tại");
      process.exit(1);
    }
    user.password = await bcrypt.hash("admin123", 10);
    await user.save();
    console.log("Mật khẩu của vin đã được cập nhật thành công");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

updatePassword();