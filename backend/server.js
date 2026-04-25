import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import bookingRoutes from "./src/routes/bookingRoutes.js";
import courtRoutes from "./src/routes/courtRoutes.js";
import { errorHandler } from "./src/middleware/errorHandler.js";
import reviewRoutes from './src/routes/reviewRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';


dotenv.config();

const app = express();

// CORS cấu hình đơn giản nhưng đủ
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/courts", courtRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);

app.get("/", (req, res) => res.send("API chạy OK"));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server chạy tại port ${PORT}`));
