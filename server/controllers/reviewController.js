import Review from "../models/Review.js";
import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";

// POST /api/reviews  (protected — only after a completed stay)
export const createReview = async (req, res, next) => {
  try {
    const { hotelId, rating, comment } = req.body;

    if (!hotelId || !rating || !comment?.trim()) {
      return res.status(400).json({ message: "hotelId, rating, and comment are required" });
    }

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    // Sweep finished stays to completed before gating.
    await Booking.updateMany(
      { user: req.user._id, status: "confirmed", checkOut: { $lt: new Date() } },
      { status: "completed" }
    );

    const stayed = await Booking.findOne({
      user: req.user._id,
      hotel: hotelId,
      status: "completed",
    });
    if (!stayed) {
      return res
        .status(403)
        .json({ message: "You can review a hotel only after a completed stay" });
    }

    const existing = await Review.findOne({ user: req.user._id, hotel: hotelId });
    if (existing) {
      return res.status(409).json({ message: "You have already reviewed this hotel" });
    }

    const review = await Review.create({
      user: req.user._id,
      hotel: hotelId,
      rating: Number(rating),
      comment: comment.trim(),
    });
    await Review.recalcHotelRating(hotelId);

    const populated = await review.populate("user", "name");
    res.status(201).json({ review: populated });
  } catch (error) {
    next(error);
  }
};

// GET /api/reviews/hotel/:hotelId
export const getHotelReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ hotel: req.params.hotelId })
      .populate("user", "name")
      .sort({ createdAt: -1 });
    res.json({ count: reviews.length, reviews });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/reviews/:id  (protected — owner or admin)
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    if (!review.user.equals(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not your review" });
    }

    await review.deleteOne();
    await Review.recalcHotelRating(review.hotel);
    res.json({ message: "Review deleted" });
  } catch (error) {
    next(error);
  }
};
