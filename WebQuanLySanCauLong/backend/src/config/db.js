import mongoose from "mongoose";
import dotenv from "dotenv";

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
  } catch (error) {
    console.log("❌ DB error:", error);
    console.log("Mongo URI đang dùng:", mongoUri);
    process.exit(1);
  }
};

export default connectDB;