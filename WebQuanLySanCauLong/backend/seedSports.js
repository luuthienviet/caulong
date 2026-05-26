import mongoose from "mongoose";
import dotenv from "dotenv";
import Sport from "./src/models/Sport.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB");
    const sports = [
      { name: "Cầu lông", code: "badminton", icon: "🏸" },
      { name: "Bóng chuyền", code: "volleyball", icon: "🏐" },
      { name: "Tennis", code: "tennis", icon: "🎾" },
      { name: "Bóng rổ", code: "basketball", icon: "🏀" },
      { name: "Pickleball", code: "pickleball", icon: "🏓" }
    ];
    for (const s of sports) {
      await Sport.findOneAndUpdate({ code: s.code }, s, { upsert: true });
    }
    console.log("Seeded sports successfully!");
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
