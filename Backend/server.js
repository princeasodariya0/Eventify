import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import authRoutes from "./routes/auth.js";
import eventRoutes from "./routes/events.js";
import bookingRoutes from "./routes/bookings.js";
import { seedDatabase } from "./seed.js";
import ExpressError from "./utils/ExpressError.js";

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
      // process.env.RENDER_DOMAIN,
      // process.env.VERCEL_DOMAIN,
    ],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
// app.use((req, res, next) => {
//   console.log("GLOBAL:", req.method, req.originalUrl);
//   console.log("HEADERS AUTH:", req.headers.authorization);
//   next();
// });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);

// Database Connection
main()
  .then(() => console.log("Database connected."))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  // seedDatabase();
}

app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

const PORT = process.env.PORT || 2726;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
