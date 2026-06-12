import { Router } from "express";
import {
  createBooking,
  getMyBookings,
  getBooking,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
} from "../controllers/bookingController.js";
import { protect, admin } from "../middleware/auth.js";

const router = Router();

router.post("/", protect, createBooking);
router.get("/my", protect, getMyBookings);
router.get("/:id", protect, getBooking);
router.put("/:id/cancel", protect, cancelBooking);
router.put("/:id/status", protect, admin, updateBookingStatus);
router.get("/", protect, admin, getAllBookings);

export default router;
