import Review from '../models/Review.js';
import Court from '../models/Court.js';

export const getReviewsByCourt = async (req, res, next) => {
  try {
    const reviews = await Review.find({ courtId: req.params.courtId }).populate('userId', 'username');
    res.json({ success: true, data: reviews });
  } catch (error) { next(error); }
};

export const createReview = async (req, res, next) => {
  try {
    const { courtId, rating, comment } = req.body;
    const userId = req.user.id;
    const existing = await Review.findOne({ courtId, userId });
    if (existing) return res.status(400).json({ message: 'Bạn đã đánh giá sân này rồi' });
    const review = await Review.create({ courtId, userId, rating, comment });
    // Cập nhật avgRating và reviewCount cho Court
    const allReviews = await Review.find({ courtId });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await Court.findByIdAndUpdate(courtId, { avgRating: avg, reviewCount: allReviews.length });
    res.status(201).json({ success: true, data: review });
  } catch (error) { next(error); }
};