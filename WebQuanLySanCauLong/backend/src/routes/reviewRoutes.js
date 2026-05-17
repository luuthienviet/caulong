import express from 'express';
import { getReviewsByCourt, createReview, getAllReviews, deleteReview } from '../controllers/reviewController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';

const router = express.Router();
router.get('/', authMiddleware, adminMiddleware, getAllReviews);
router.get('/:courtId', getReviewsByCourt);
router.post('/', authMiddleware, createReview);
router.delete('/:id', authMiddleware, adminMiddleware, deleteReview);
export default router;