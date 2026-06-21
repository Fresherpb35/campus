import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { createChat, getChats, getMessages, updateChatQuantity } from "../controllers/chat.controller.js";

const router = express.Router();

router.post("/create", protect, createChat);
router.get("/all", protect, getChats);
router.get("/messages/:chatId", protect, getMessages);
router.patch("/update-quantity/:chatId", protect, updateChatQuantity);

export default router;