import {
  getAllusers,
  signin,
  signup,
  getUser,
  signout,
  isVerifiedUser,
  updateProfile,
  rejectUser,
} from "../controllers/auth.controller.js";
import { isAdmin, protect } from "../middlewares/auth.middleware.js";
import express from "express";
const router = express.Router();

//  http methods
router.post("/signup", signup);
router.post("/signin", signin);
router.get("/get-user", protect, getUser);
router.put("/update-profile", protect, updateProfile);
router.post("/signout", signout);

//  admin:
router.get("/admin/get-users", protect, isAdmin, getAllusers);
router.post("/admin/verify-user/:id", protect, isAdmin, isVerifiedUser);
router.post("/admin/reject-user/:id", protect, isAdmin, rejectUser);

export default router;