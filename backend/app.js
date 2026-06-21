import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRouter from "./api/routes/auth.routes.js";
import collegeRouter from "./api/routes/college.routes.js";
import productRouter from "./api/routes/product.routes.js";
import wishlistRouter from "./api/routes/wishlist.routes.js";
import chatRouter from "./api/routes/chat.routes.js";
import orderRouter from "./api/routes/order.routes.js";
import debugRouter from "./api/routes/debug.routes.js";
import cookieParser from "cookie-parser";
//  config:
dotenv.config(); //it will return process object
const app = express();
//  middlewares:
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
//  routes:
app.use("/api/auth", authRouter);
app.use("/api/college", collegeRouter);
app.use("/api/products", productRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/chat", chatRouter);
app.use("/api/orders", orderRouter);
app.use("/api/debug", debugRouter);
export default app;