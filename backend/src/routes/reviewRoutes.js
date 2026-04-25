import express from 'express';
import { getReviewsByCourt, createReview } from '../controllers/reviewController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/:courtId', getReviewsByCourt);
router.post('/', authMiddleware, createReview);
export default router;