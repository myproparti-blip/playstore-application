import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import { errorHandler } from "./middleware/errorMiddleware.js";

// ===== Async wrapper for startup =====
const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  }

  const app = express();

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  app.use(
    cors({
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"), {
      setHeaders: (res) => {
        res.set("Access-Control-Allow-Origin", "*");
        res.set("Cross-Origin-Resource-Policy", "cross-origin");
      },
    })
  );

  app.use("/api/auth", (await import("./routes/authRoutes.js")).default);
  app.use("/api/consultants", (await import("./routes/consultantRoutes.js")).default);
  app.use("/api/properties", (await import("./routes/propertyRoutes.js")).default);
  app.use("/api/payments", (await import("./routes/paymentRoutes.js")).default);
  app.use("/api/agents", (await import("./routes/agentRoutes.js")).default);

  app.get("/", (req, res) => {
    res.send({ message: "✅ API is running successfully on Vercel!" });
  });

  app.use(errorHandler);

  return app;
};

export default await startServer();
