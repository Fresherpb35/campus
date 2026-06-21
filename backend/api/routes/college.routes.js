import express from "express";
import {
  createCollege,
  getallColleges,
} from "../controllers/college.controller.js";
import { isAdmin, protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

//  crud routes:

router.post("/admin", protect, isAdmin, createCollege);
router.get("/get-colleges", getallColleges);

export default router;