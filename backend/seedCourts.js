import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Court from './src/models/Court.js';

dotenv.config();

const courts = [
  { name: "SÂN SỐ 01 - VIP", price: 200000, description: "Sân VIP, thảm Yonex cao cấp, ánh sáng chuẩn thi đấu.", image: "https://www.alobo.vn/wp-content/uploads/2025/08/image-108.png", status: "Trống" },
  { name: "SÂN SỐ 02 - CHUẨN", price: 120000, description: "Sân tiêu chuẩn thi đấu, phù hợp mọi trình độ.", image: "https://sonsanepoxy.vn/wp-content/uploads/2023/07/Thi-cong-san-cau-long.jpg", status: "Trống" },
  { name: "SÂN SỐ 03 - THƯỜNG", price: 100000, description: "Sân tiết kiệm, phù hợp tập luyện hằng ngày.", image: "https://thethaothienlong.vn/wp-content/uploads/2022/04/Danh-sach-san-cau-long-o-tphcm-1.jpg", status: "Trống" },
  { name: "SÂN SỐ 04 - VIP", price: 200000, description: "Sân VIP mới, không gian rộng, ánh sáng chống chói.", image: "https://tinphatsports.vn/wp-content/uploads/2024/05/thi-cong-san-bong-chuyen-17-1.jpg", status: "Trống" }
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Court.deleteMany(); // Xóa tất cả sân cũ (nếu muốn giữ lại sân khác thì không nên dùng deleteMany)
    await Court.insertMany(courts);
    console.log('✅ Đã thêm 4 sân mặc định vào database');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();