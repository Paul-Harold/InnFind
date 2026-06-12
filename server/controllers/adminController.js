import User from "../models/User.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import Booking from "../models/Booking.js";
import Review from "../models/Review.js";

// GET /api/admin/stats  (admin)
export const getStats = async (req, res, next) => {
  try {
    const [hotels, rooms, users, bookings, reviews, revenueAgg] = await Promise.all([
      Hotel.countDocuments(),
      Room.countDocuments(),
      User.countDocuments(),
      Booking.countDocuments(),
      Review.countDocuments(),
      Booking.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
    ]);

    res.json({
      stats: {
        hotels,
        rooms,
        users,
        bookings,
        reviews,
        revenue: revenueAgg[0]?.total || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
