import express from "express";
import { echoRequest } from "../controllers/debug.controller.js";

const router = express.Router();

router.get("/cookies", echoRequest);

export default router;
