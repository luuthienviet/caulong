import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Court from './src/models/Court.js';

dotenv.config();

const courts = [
  { name: "SÂN SỐ 01 - VIP", price: 200000, description: "Sân VIP, thảm Yonex cao cấp, ánh sáng chuẩn thi đấu.", image: "https://www.alobo.vn/wp-content/uploads/2025/08/image-108.png", status: "Trống" },
  { name: "SÂN SỐ 02 - CHUẨN", price: 120000, description: "Sân tiêu chuẩn thi đấu, phù hợp mọi trình độ.", image: "https://sonsanepoxy.vn/wp-content/uploads/2023/07/Thi-cong-san-cau-long.jpg", status: "Trống" },
  { name: "SÂN SỐ 03 - THƯỜNG", price: 100000, description: "Sân tiết kiệm, phù hợp tập luyện hằng ngày.", image: "https://thethaothienlong.vn/wp-content/uploads/2022/04/Danh-sach-san-cau-long-o-tphcm-1.jpg", status: "Trống" },
  { name: "SÂN SỐ 04 - VIP", price: 200000, description: "Sân VIP mới, không gian rộng, ánh sáng chống chói.", image: "https://tinphatsports.vn/wp-content/uploads/2024/05/thi-cong-san-bong-chuyen-17-1.jpg", status: "Trống" },
  { name: "SÂN SỐ 05 - VIP", price: 200000, description: "Sân VIP đạt tiêu chuẩn quốc tế BWF, thảm Yonex dày 5mm, khán đài mini chuyên nghiệp.", image: "https://plurysports.com/wp-content/uploads/2021/11/badminton-court-construction.jpg", status: "Trống" },
  { name: "SÂN SỐ 06 - CHUẨN", price: 120000, description: "Sân tiêu chuẩn thi đấu, không gian thoáng mát, hệ thống thông gió hiện đại.", image: "https://onsport.vn/images/badminton-court.jpg", status: "Trống" },
  { name: "SÂN SỐ 07 - THƯỜNG", price: 100000, description: "Sân tập luyện phổ thông, ánh sáng tốt, phù hợp cho học sinh/sinh viên rèn luyện sức khỏe.", image: "https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?q=80&w=2070", status: "Trống" },
  { name: "SÂN SỐ 08 - CHUẨN", price: 120000, description: "Sân tiêu chuẩn thi đấu chuyên nghiệp, hệ thống đèn chống lóa mắt tốt cho sức khỏe thị lực.", image: "https://thethaodonga.com/wp-content/uploads/2022/10/kich-thuoc-san-cau-long-1.jpeg", status: "Trống" }
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Court.deleteMany(); // Xóa tất cả sân cũ
    await Court.insertMany(courts);
    console.log('✅ Đã thêm 8 sân mặc định vào database thành công!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();