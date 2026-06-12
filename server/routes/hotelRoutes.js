import { Router } from "express";
import {
  getHotels,
  getHotel,
  createHotel,
  updateHotel,
  deleteHotel,
} from "../controllers/hotelController.js";
import { protect, admin } from "../middleware/auth.js";

const router = Router();

router.get("/", getHotels);
router.get("/:id", getHotel);
router.post("/", protect, admin, createHotel);
router.put("/:id", protect, admin, updateHotel);
router.delete("/:id", protect, admin, deleteHotel);

export default router;
