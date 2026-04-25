import express from 'express';
import { getUserNotifications, markAsRead, deleteNotification } from '../controllers/notificationController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);
router.get('/', getUserNotifications);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

export default router;