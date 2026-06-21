import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { createOrder, getMyOrders } from "../controllers/order.controller.js";

const router = express.Router();

router.post("/create", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);

export default router;