import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import Booking from "../models/Booking.js";
import { hasOverlap } from "./bookingController.js";

// GET /api/rooms?city=&minPrice=&maxPrice=&guests=&amenities=&rating=
// Main browse endpoint: rooms across hotels, filterable.
export const getRooms = async (req, res, next) => {
  try {
    const { city, minPrice, maxPrice, guests, amenities, rating } = req.query;

    const filter = {};

    // City and rating live on the hotel, so resolve matching hotels first.
    if (city || rating) {
      const hotelFilter = {};
      if (city) hotelFilter.city = { $regex: city, $options: "i" };
      if (rating) hotelFilter.rating = { $gte: Number(rating) };
      const hotelIds = await Hotel.find(hotelFilter).distinct("_id");
      filter.hotel = { $in: hotelIds };
    }

    if (minPrice || maxPrice) {
      filter.pricePerNight = {};
      if (minPrice) filter.pricePerNight.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerNight.$lte = Number(maxPrice);
    }
    if (guests) filter.maxGuests = { $gte: Number(guests) };
    if (amenities) filter.amenities = { $all: amenities.split(",") };

    const rooms = await Room.find(filter)
      .populate("hotel", "name city rating numReviews")
      .sort({ pricePerNight: 1 });

    res.json({ count: rooms.length, rooms });
  } catch (error) {
    next(error);
  }
};

// Keep hotel.cheapestPrice in sync with its rooms.
const refreshCheapestPrice = async (hotelId) => {
  const cheapest = await Room.findOne({ hotel: hotelId }).sort({ pricePerNight: 1 });
  await Hotel.findByIdAndUpdate(hotelId, {
    cheapestPrice: cheapest ? cheapest.pricePerNight : 0,
  });
};

// POST /api/rooms  (admin)
export const createRoom = async (req, res, next) => {
  try {
    const { hotelId, ...fields } = req.body;
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }
    const room = await Room.create({ ...fields, hotel: hotel._id });
    await refreshCheapestPrice(hotel._id);
    res.status(201).json({ room });
  } catch (error) {
    next(error);
  }
};

// PUT /api/rooms/:id  (admin)
export const updateRoom = async (req, res, next) => {
  try {
    const { hotelId, hotel, ...fields } = req.body; // a room can't move hotels
    const room = await Room.findByIdAndUpdate(req.params.id, fields, {
      new: true,
      runValidators: true,
    });
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    await refreshCheapestPrice(room.hotel);
    res.json({ room });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/rooms/:id  (admin) — cascades to the room's bookings
export const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    await Booking.deleteMany({ room: room._id });
    await refreshCheapestPrice(room.hotel);
    res.json({ message: "Room deleted" });
  } catch (error) {
    next(error);
  }
};

// GET /api/rooms/availability/:id?checkIn=&checkOut=
export const checkAvailability = async (req, res, next) => {
  try {
    const { checkIn, checkOut } = req.query;
    if (!checkIn || !checkOut) {
      return res.status(400).json({ message: "checkIn and checkOut are required" });
    }
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    const taken = await hasOverlap(room._id, new Date(checkIn), new Date(checkOut));
    res.json({ available: !taken });
  } catch (error) {
    next(error);
  }
};

// GET /api/rooms/:id — room detail with full hotel info
export const getRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).populate("hotel");
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    res.json({ room });
  } catch (error) {
    next(error);
  }
};
