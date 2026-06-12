import { Router } from "express";
import {
  getRooms,
  getRoom,
  checkAvailability,
  createRoom,
  updateRoom,
  deleteRoom,
} from "../controllers/roomController.js";
import { protect, admin } from "../middleware/auth.js";

const router = Router();

router.get("/", getRooms);
router.get("/availability/:id", checkAvailability);
router.get("/:id", getRoom);
router.post("/", protect, admin, createRoom);
router.put("/:id", protect, admin, updateRoom);
router.delete("/:id", protect, admin, deleteRoom);

export default router;
