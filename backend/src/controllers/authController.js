import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../utils/emailService.js";

export const register = async (req, res, next) => {
  try {
    const { username, password, role, email, phone, name } = req.body;
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ message: "Tên đăng nhập đã tồn tại" });
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ username, name: name || '', password: hash, role: role || "user", email: email || '', phone: phone || '' });
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
    res.json({ token, user: { id: user._id, username: user.username, name: user.name || '', role: user.role, email: user.email || '', phone: user.phone || '' } });
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

export const updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });
    user.name = name ?? user.name;
    user.email = email ?? user.email;
    user.phone = phone ?? user.phone;
    await user.save();
    res.json({ message: "Cập nhật thông tin thành công", user: { id: user._id, username: user.username, name: user.name, role: user.role, email: user.email, phone: user.phone } });
  } catch (error) { next(error); }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Mật khẩu hiện tại không chính xác" });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (error) { next(error); }
};

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'user' }).select('username name email phone createdAt');
    res.status(200).json({ success: true, data: users });
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