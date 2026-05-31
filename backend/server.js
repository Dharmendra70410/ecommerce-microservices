import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import cartRoutes from "./src/routes/cartRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;
const clientOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || clientOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("CORS blocked"));
    },
    credentials: true
  })
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    gateway: "ok",
    orderService: "ok",
    inventoryService: "ok",
    paymentWorker: "ok",
    redis: "ok",
    updatedAt: new Date().toISOString()
  });
});

app.get("/logs", (_req, res) => {
  res.json([
    {
      timestamp: new Date().toISOString(),
      level: "INFO",
      message: "Auth service started"
    }
  ]);
});

app.use("/", authRoutes);
app.use("/api/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/api/products", productRoutes);
app.use("/cart", cartRoutes);
app.use("/api/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/api/orders", orderRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

async function start() {
  const mongoUri = process.env.FRIEND_MONGODB_URI || process.env.MONGODB_URI;
  process.env.JWT_SECRET ||= "dev_jwt_secret_replace_in_env";

  if (!mongoUri) {
    console.error("MONGODB_URI or FRIEND_MONGODB_URI is missing. Add it in backend/.env");
    process.exit(1);
  }

  try {
    await connectDB(mongoUri);
    console.log("Connected to MongoDB");

    app.listen(port, () => {
      console.log(`Backend running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to connect MongoDB", error.message);
    process.exit(1);
  }
}

start();
