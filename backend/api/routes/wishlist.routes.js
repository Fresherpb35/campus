import express from "express";
import { protect, isUser } from "../middlewares/auth.middleware.js";
import {
  toggleWishlist,
  getWishlist,
  getWishlistedIds,
} from "../controllers/wishlist.controller.js";

const router = express.Router();

router.use(protect, isUser);

router.post("/toggle", toggleWishlist);
router.get("/get-all", getWishlist);
router.get("/ids", getWishlistedIds);

export default router;