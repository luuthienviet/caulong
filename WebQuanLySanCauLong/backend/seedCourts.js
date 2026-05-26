import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import Court from "./src/models/Court.js";
import Sport from "./src/models/Sport.js";

dotenv.config();

const branches = [
  'kt', 'hn', 'hcm', 'dn', 'ct', 'hp', 'qn', 'nt', 'dl', 'vt', 'bd', 'dni', 'bn', 'th', 'na', 'hue', 'pq'
];

const sampleImages = {
  'badminton': [
    'https://sonsanepoxy.vn/wp-content/uploads/2023/07/Thi-cong-san-cau-long.jpg',
    'https://thethaothienlong.vn/wp-content/uploads/2022/04/Danh-sach-san-cau-long-o-tphcm-1.jpg',
    'https://tinphatsports.vn/wp-content/uploads/2024/05/thi-cong-san-bong-chuyen-17-1.jpg',
    'https://plurysports.com/wp-content/uploads/2021/11/badminton-court-construction.jpg'
  ],
  'volleyball': [
    'https://thethaongoaitroi.vn/wp-content/uploads/2021/04/san-bong-chuyen-tieu-chuan.jpg',
    'https://thethaodonga.com/wp-content/uploads/2022/08/kich-thuoc-san-bong-chuyen-1.jpeg'
  ],
  'tennis': [
    'https://thethaodonga.com/wp-content/uploads/2022/07/kich-thuoc-san-tennis.jpeg',
    'https://cdn.tuoitre.vn/471584752817336320/2023/1/14/tennis-1673663673400508101511.jpg'
  ],
  'basketball': [
    'https://sport24h.com.vn/uploads/images/kich-thuoc-san-bong-ro-tieu-chuan.jpg',
    'https://www.thethaothientruong.vn/uploads/contents/kich-thuoc-san-bong-ro.jpg'
  ],
  'pickleball': [
    'https://cdn.tuoitre.vn/471584752817336320/2024/8/16/pickleball-17237936154691436157017.jpg',
    'https://cdn.thuvienphapluat.vn/uploads/tintuc/2024/08/21/san-pickleball.jpg'
  ],
  'gôn': [
    'https://cdn.sgtiepthi.vn/wp-content/uploads/2021/11/170669-San-golf-Tan-Son-Nhat.jpg',
    'https://www.vinpearl.com/sites/default/files/2021-04/san-golf-phu-quoc-8_1617260551.jpg'
  ]
};

const seedCourts = async () => {
  try {
    await connectDB();

    const sports = await Sport.find();
    if (sports.length === 0) {
      console.log("Không có môn thể thao nào trong DB! Hãy chạy seedSports.js trước.");
      process.exit();
    }

    let courtsToInsert = [];

    sports.forEach(sport => {
      // Create 2 to 4 courts for each sport
      const numCourts = Math.floor(Math.random() * 3) + 2; // 2, 3, or 4
      
      for (let i = 1; i <= numCourts; i++) {
        // Pick a random branch
        const branch = branches[Math.floor(Math.random() * branches.length)];
        
        // Pick a random image or fallback
        const images = sampleImages[sport.code] || sampleImages['badminton'];
        const image = images[Math.floor(Math.random() * images.length)];

        // Generate random price between 100k and 300k
        const price = Math.floor(Math.random() * 20 + 10) * 10000;

        courtsToInsert.push({
          name: `SÂN ${sport.name.toUpperCase()} LTV ${branch.toUpperCase()} - ${i.toString().padStart(2, '0')}`,
          price: price,
          description: `Sân ${sport.name} tiêu chuẩn quốc tế, phù hợp cho mọi lứa tuổi và trình độ. Trang thiết bị hiện đại nhất.`,
          image: image,
          sport: sport.code,
          branch: branch,
          status: "Trống",
          avgRating: (Math.random() * 1.5 + 3.5).toFixed(1), // 3.5 to 5.0
          reviewCount: Math.floor(Math.random() * 50)
        });
      }
    });

    await Court.insertMany(courtsToInsert);
    console.log(`Đã tạo thành công ${courtsToInsert.length} sân mẫu cho ${sports.length} môn thể thao!`);
    
    process.exit();
  } catch (error) {
    console.error("Error seeding courts:", error);
    process.exit(1);
  }
};

seedCourts();