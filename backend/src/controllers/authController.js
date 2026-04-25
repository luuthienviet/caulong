import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../utils/emailService.js";

export const register = async (req, res, next) => {
  try {
    const { username, password, role, email } = req.body;
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ message: "Tên đăng nhập đã tồn tại" });
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hash, role: role || "user", email: email || '' });
    await user.save();
    res.status(201).json({ message: "Đăng ký thành công" });
  } catch (error) { next(error); }
};

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "Sai tài khoản" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Sai mật khẩu" });
    const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (error) { next(error); }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email không tồn tại" });
    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 giờ
    await user.save();
    const resetUrl = `http://localhost:3000/reset-password/${token}`;
    const html = `<h2>Đặt lại mật khẩu</h2><p>Bấm vào link: <a href="${resetUrl}">${resetUrl}</a></p><p>Link có hiệu lực 1 giờ.</p>`;
    await sendEmail(user.email, 'Đặt lại mật khẩu - Kontum Badminton', html);
    res.json({ message: "Email đặt lại mật khẩu đã được gửi" });
  } catch (error) { next(error); }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: "Mật khẩu đã được đặt lại thành công" });
  } catch (error) { next(error); }
};