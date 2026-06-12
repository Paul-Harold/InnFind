import Booking from "../models/Booking.js";
import Room from "../models/Room.js";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const startOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

// A room is unavailable if any confirmed booking overlaps the requested range.
export const hasOverlap = async (roomId, checkIn, checkOut, excludeBookingId = null) => {
  const filter = {
    room: roomId,
    status: "confirmed",
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
  };
  if (excludeBookingId) filter._id = { $ne: excludeBookingId };
  const conflict = await Booking.findOne(filter);
  return Boolean(conflict);
};

const nextReceiptNumber = async () => {
  const year = new Date().getFullYear();
  const count = await Booking.countDocuments();
  return `RCP-${year}-${String(count + 1).padStart(5, "0")}`;
};

// POST /api/bookings  (protected)
export const createBooking = async (req, res, next) => {
  try {
    const { roomId, checkIn, checkOut, guests } = req.body;

    if (!roomId || !checkIn || !checkOut || !guests) {
      return res
        .status(400)
        .json({ message: "roomId, checkIn, checkOut, and guests are required" });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate) || isNaN(checkOutDate)) {
      return res.status(400).json({ message: "Invalid dates" });
    }
    if (checkInDate < startOfToday()) {
      return res.status(400).json({ message: "Check-in cannot be in the past" });
    }
    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ message: "Check-out must be after check-in" });
    }

    const room = await Room.findById(roomId).populate("hotel", "name city");
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    if (guests > room.maxGuests) {
      return res
        .status(400)
        .json({ message: `This room sleeps at most ${room.maxGuests} guests` });
    }

    if (await hasOverlap(room._id, checkInDate, checkOutDate)) {
      return res
        .status(409)
        .json({ message: "This room is already booked for those dates" });
    }

    // Price is always computed server-side.
    const nights = Math.round((checkOutDate - checkInDate) / MS_PER_DAY);
    const totalPrice = nights * room.pricePerNight;

    const booking = await Booking.create({
      user: req.user._id,
      room: room._id,
      hotel: room.hotel._id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      nights,
      totalPrice,
      receiptNumber: await nextReceiptNumber(),
    });

    res.status(201).json({ booking });
  } catch (error) {
    next(error);
  }
};

// Confirmed stays whose checkout has passed become "completed".
const completeFinishedBookings = async (userFilter = {}) => {
  await Booking.updateMany(
    { ...userFilter, status: "confirmed", checkOut: { $lt: new Date() } },
    { status: "completed" }
  );
};

// GET /api/bookings/my  (protected)
export const getMyBookings = async (req, res, next) => {
  try {
    await completeFinishedBookings({ user: req.user._id });
    const bookings = await Booking.find({ user: req.user._id })
      .populate("room", "title photos pricePerNight")
      .populate("hotel", "name city")
      .sort({ checkIn: -1 });
    res.json({ count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};

// GET /api/bookings/:id  (protected — owner or admin)
export const getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("room", "title photos pricePerNight maxGuests")
      .populate("hotel", "name city address")
      .populate("user", "name email");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    const isOwner = booking.user._id.equals(req.user._id);
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not your booking" });
    }
    res.json({ booking });
  } catch (error) {
    next(error);
  }
};

// PUT /api/bookings/:id/cancel  (protected — owner only)
export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (!booking.user.equals(req.user._id)) {
      return res.status(403).json({ message: "Not your booking" });
    }
    if (booking.status !== "confirmed") {
      return res.status(400).json({ message: `Booking is already ${booking.status}` });
    }
    if (booking.checkIn <= new Date()) {
      return res.status(400).json({ message: "Stay has already started" });
    }

    booking.status = "cancelled";
    await booking.save();
    res.json({ booking });
  } catch (error) {
    next(error);
  }
};

// PUT /api/bookings/:id/status  (admin)
export const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["confirmed", "cancelled", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate("user", "name email")
      .populate("room", "title")
      .populate("hotel", "name city");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json({ booking });
  } catch (error) {
    next(error);
  }
};

// GET /api/bookings  (admin)
export const getAllBookings = async (req, res, next) => {
  try {
    await completeFinishedBookings();
    const bookings = await Booking.find()
      .populate("user", "name email")
      .populate("room", "title")
      .populate("hotel", "name city")
      .sort({ createdAt: -1 });
    res.json({ count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};
