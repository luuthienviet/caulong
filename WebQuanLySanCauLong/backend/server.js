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
import contactRoutes from './src/routes/contactRoutes.js';
import chatbotRoutes from './src/routes/chatbotRoutes.js';
import serviceRoutes from './src/routes/serviceRoutes.js';

dotenv.config();
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// DEBUG MONGO URI
console.log("MONGO_URI =", process.env.MONGO_URI);

const app = express();

// ========== CẤU HÌNH CORS ==========
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/courts", courtRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/services', serviceRoutes);

app.get("/", (req, res) => res.send("API chạy OK"));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`🚀 Server chạy tại port ${PORT}`));
}

export default app;