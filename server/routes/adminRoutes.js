import { Router } from "express";
import { getStats } from "../controllers/adminController.js";
import { protect, admin } from "../middleware/auth.js";

const router = Router();

router.get("/stats", protect, admin, getStats);

export default router;
