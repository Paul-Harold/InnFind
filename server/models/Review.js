import mongoose from "mongoose";
import Hotel from "./Hotel.js";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, "Comment is required"],
      trim: true,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

// One review per user per hotel.
reviewSchema.index({ user: 1, hotel: 1 }, { unique: true });

// Recompute the hotel's average rating and review count.
reviewSchema.statics.recalcHotelRating = async function (hotelId) {
  const [stats] = await this.aggregate([
    { $match: { hotel: new mongoose.Types.ObjectId(String(hotelId)) } },
    { $group: { _id: "$hotel", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  await Hotel.findByIdAndUpdate(hotelId, {
    rating: stats ? Math.round(stats.avg * 10) / 10 : 0,
    numReviews: stats ? stats.count : 0,
  });
};

const Review = mongoose.model("Review", reviewSchema);

export default Review;
