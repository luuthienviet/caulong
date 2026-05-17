import express from 'express';
import Contact from '../models/Contact.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';

const router = express.Router();

// 1. Gửi tin nhắn liên hệ mới (Public)
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, subject, message } = req.body;
    if (!name || !phone || !message) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ thông tin bắt buộc (*)' });
    }

    const newContact = new Contact({
      name,
      phone,
      email: email || '',
      subject: subject || 'Đặt sân & Hợp tác',
      message
    });

    await newContact.save();
    res.status(201).json({ success: true, data: newContact, message: 'Gửi liên hệ thành công!' });
  } catch (error) {
    console.error('Lỗi khi gửi liên hệ:', error);
    res.status(500).json({ success: false, message: 'Đã xảy ra lỗi trên máy chủ khi gửi liên hệ.' });
  }
});

// 2. Lấy danh sách tin nhắn liên hệ (Admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: contacts });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách liên hệ:', error);
    res.status(500).json({ success: false, message: 'Đã xảy ra lỗi trên máy chủ.' });
  }
});

// 3. Cập nhật trạng thái tin nhắn (Admin only)
router.put('/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['unread', 'read', 'replied'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy liên hệ' });
    }

    res.status(200).json({ success: true, data: contact, message: 'Cập nhật trạng thái thành công!' });
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái liên hệ:', error);
    res.status(500).json({ success: false, message: 'Đã xảy ra lỗi trên máy chủ.' });
  }
});

// 4. Xóa tin nhắn liên hệ (Admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy liên hệ' });
    }
    res.status(200).json({ success: true, message: 'Đã xóa tin nhắn liên hệ thành công!' });
  } catch (error) {
    console.error('Lỗi khi xóa liên hệ:', error);
    res.status(500).json({ success: false, message: 'Đã xảy ra lỗi trên máy chủ.' });
  }
});

export default router;
