import Review from '../models/Review.js';
import Court from '../models/Court.js';

export const getReviewsByCourt = async (req, res, next) => {
  try {
    const reviews = await Review.find({ courtId: req.params.courtId }).populate('userId', 'username name');
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

export const getAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find().populate('userId', 'username name email').populate('courtId', 'name').sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (error) { next(error); }
};

export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    
    // Cập nhật lại điểm của sân
    const allReviews = await Review.find({ courtId: review.courtId });
    const avg = allReviews.length > 0 ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length : 0;
    await Court.findByIdAndUpdate(review.courtId, { avgRating: avg, reviewCount: allReviews.length });
    
    res.json({ success: true, message: 'Đã xóa đánh giá' });
  } catch (error) { next(error); }
};