import { db } from "./api/config/db.js";
import app from "./app.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { setupSocket } from "./api/socket/socket.js";

const port = process.env.PORT || 5000;

db();

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174"],
    credentials: true,
  },
});

setupSocket(io);

httpServer.listen(port, () => {
    console.log(`server is running on port ${port}`);
});
