import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import Booking from "../models/Booking.js";
import Review from "../models/Review.js";

// GET /api/hotels?city=&minPrice=&maxPrice=&amenities=&rating=&featured=
export const getHotels = async (req, res, next) => {
  try {
    const { city, minPrice, maxPrice, amenities, rating, featured } = req.query;

    const filter = {};
    if (city) filter.city = { $regex: city, $options: "i" };
    if (featured === "true") filter.featured = true;
    if (rating) filter.rating = { $gte: Number(rating) };
    if (amenities) filter.amenities = { $all: amenities.split(",") };
    if (minPrice || maxPrice) {
      filter.cheapestPrice = {};
      if (minPrice) filter.cheapestPrice.$gte = Number(minPrice);
      if (maxPrice) filter.cheapestPrice.$lte = Number(maxPrice);
    }

    const hotels = await Hotel.find(filter).sort({ featured: -1, rating: -1 });
    res.json({ count: hotels.length, hotels });
  } catch (error) {
    next(error);
  }
};

// GET /api/hotels/:id — hotel detail including its rooms
export const getHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }
    const rooms = await Room.find({ hotel: hotel._id }).sort({ pricePerNight: 1 });
    res.json({ hotel, rooms });
  } catch (error) {
    next(error);
  }
};

// POST /api/hotels  (admin)
export const createHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.create(req.body);
    res.status(201).json({ hotel });
  } catch (error) {
    next(error);
  }
};

// PUT /api/hotels/:id  (admin)
export const updateHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }
    res.json({ hotel });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/hotels/:id  (admin) — cascades to rooms, bookings, and reviews
export const deleteHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }
    await Promise.all([
      Room.deleteMany({ hotel: hotel._id }),
      Booking.deleteMany({ hotel: hotel._id }),
      Review.deleteMany({ hotel: hotel._id }),
    ]);
    res.json({ message: "Hotel and related data deleted" });
  } catch (error) {
    next(error);
  }
};
