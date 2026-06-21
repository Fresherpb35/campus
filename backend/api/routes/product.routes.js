import express from "express";
import {
  createProduct,
  getAllProducts,
  getMyListing,
  markAsSold,
  updateProduct,
  deleteProduct,
  getProductById,
} from "../controllers/products.controller.js";
import upload from "../middlewares/multer.js";
import { isUser, protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post(
  "/create",
  protect,
  isUser,
  upload.array("image", 5),
  createProduct,
);
router.get("/get-all", getAllProducts);
router.get("/get-myListing", protect, isUser, getMyListing);
router.get("/get/:id", getProductById);
router.patch("/mark-as-sold/:id", protect, isUser, markAsSold);
router.put(
  "/update/:id",
  protect,
  isUser,
  upload.array("image", 5),
  updateProduct,
);
router.delete("/delete/:id", protect, isUser, deleteProduct);

export default router;
