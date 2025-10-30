// server.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import { errorHandler } from "./middleware/errorMiddleware.js";

// Import Routes
import authRoutes from "./routes/authRoutes.js";
import consultantRoutes from "./routes/consultantRoutes.js";
import propertyRoutes from "./routes/propertyRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import agentRoutes from "./routes/agentRoutes.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ CORS
app.use(
  cors({
    origin: [
      "https://playstore-application.vercel.app",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ Connect DB before routes
await connectDB();

// ✅ Static folder
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res) => {
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/consultants", consultantRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/agents", agentRoutes);

// ✅ Default route
app.get("/api", (req, res) => {
  res.json({ message: "Backend API running successfully ✅" });
});

// ✅ Error handler
app.use(errorHandler);

// ✅ Export app (for Vercel)
export default app;

// ✅ Local dev only
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () =>
    console.log(`✅ Server running on http://localhost:${PORT}`)
  );
}
