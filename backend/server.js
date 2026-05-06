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

// ========== CẤU HÌNH CORS CHO PRODUCTION ==========
// Trong quá trình phát triển, bạn có thể để localhost:3000
// Khi lên production, thay bằng URL thật của frontend
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));

app.use(cors({
  origin: function (origin, callback) {
    // Cho phép requests không có origin (như từ Postman, mobile apps)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'CORS policy does not allow access from this origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/courts", courtRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);

app.get("/", (req, res) => res.send("API chạy OK"));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server chạy tại port ${PORT}`));