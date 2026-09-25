import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import {connectDB} from "./config/db.js";
import {notFound, errorHandler} from "./middleware/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import leadRoutes from "./routes/lead.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import taskRoutes from "./routes/task.routes.js";
import noteRoutes from "./routes/note.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config();

const app = express();

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow all origins (standard for Bearer token SaaS APIs)
            callback(null, true);
        },
        credentials: true,
    })
);
app.use(express.json({limit: "1mb"}));
app.use(express.urlencoded({extended: true}));
if(process.env.NODE_ENV !== "production") app.use(morgan("dev"));

// Health checks (respond immediately without requiring DB connection)
const healthHandler = (req, res) => {
    res.json({
        success: true,
        status: "ok",
        service: "Nexus CRM API",
        db: mongoose.connection.readyState === 1 ? "connected" : "connecting"
    });
};

app.get("/", healthHandler);
app.get("/health", healthHandler);
app.get("/api", healthHandler);
app.get("/api/health", healthHandler);

// DB connection middleware for data routes
app.use(async (req, res, next) => {
    try {
        if (process.env.MONGO_URI || process.env.MONGO_URL) {
            await connectDB();
        }
        next();
    } catch (err) {
        console.error("DB connection middleware error:", err.message);
        return res.status(500).json({
            success: false,
            message: "Database connection failed",
            error: err.message
        });
    }
});

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8000;

// Only bind to local port when running locally (not inside Vercel Serverless Functions)
if (!process.env.VERCEL) {
    connectDB()
        .then(() => {
            app.listen(PORT, () => 
                console.log(`Nexus CRM API is running on port http://localhost:${PORT}`)
            );
        })
        .catch((err) => {
            console.error("Failed to connect to the database on start:", err.message);
            app.listen(PORT, () => 
                console.log(`Nexus CRM API running (no db) on port http://localhost:${PORT}`)
            );
        });
}

export default app;