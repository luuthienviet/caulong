import mongoose from "mongoose";
import dotenv from "dotenv";
import Court from "../models/Court.js";

dotenv.config();

const mongoUri =
  process.env.MONGO_URI ||
  process.env.MONGO_FALLBACK_URI ||
  "mongodb+srv://caulong:Abc%401234@cluster0.dezz4ov.mongodb.net/?retryWrites=true&w=majority";

const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000
    });

    console.log("✅ MongoDB connected");

    // Tự động seed 4 sân mặc định nếu DB trống
    const courtCount = await Court.countDocuments();
    if (courtCount === 0) {
      console.log("🌱 Database trống. Đang seed các sân mặc định...");
      const defaultCourts = [
        { name: "SÂN SỐ 01 - VIP", price: 200000, description: "Sân VIP, thảm Yonex cao cấp, ánh sáng chuẩn thi đấu.", status: "Trống", image: "https://www.alobo.vn/wp-content/uploads/2025/08/image-108.png" },
        { name: "SÂN SỐ 02 - CHUẨN", price: 120000, description: "Sân tiêu chuẩn thi đấu, phù hợp mọi trình độ.", status: "Trống", image: "https://sonsanepoxy.vn/wp-content/uploads/2023/07/Thi-cong-san-cau-long.jpg" },
        { name: "SÂN SỐ 03 - THƯỜNG", price: 100000, description: "Sân tiết kiệm, phù hợp tập luyện hằng ngày.", status: "Trống", image: "https://thethaothienlong.vn/wp-content/uploads/2022/04/Danh-sach-san-cau-long-o-tphcm-1.jpg" },
        { name: "SÂN SỐ 04 - VIP", price: 200000, description: "Sân VIP mới, không gian rộng, ánh sáng chống chói.", status: "Trống", image: "https://tinphatsports.vn/wp-content/uploads/2024/05/thi-cong-san-bong-chuyen-17-1.jpg" }
      ];
      await Court.insertMany(defaultCourts);
      console.log("✅ Seed các sân mặc định thành công!");
    }
  } catch (error) {
    console.log("❌ DB error:", error);
    console.log("Mongo URI đang dùng:", mongoUri);
    process.exit(1);
  }
};

export default connectDB;