import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import morgan from "morgan";
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
dotenv.config(); // Fallback to current working directory

const app = express();

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow all origins (standard for public SaaS APIs with Bearer token authentication)
            callback(null, true);
        },
        credentials: true,
    })
);
app.use(express.json({limit: "1mb"}))
app.use(express.urlencoded({extended: true}));
if(process.env.NODE_ENV !== "production") app.use(morgan("dev"));

// Ensure DB is connected before processing API requests
app.use(async (req, res, next) => {
    try {
        if (process.env.MONGO_URI || process.env.MONGO_URL) {
            await connectDB();
        }
        next();
    } catch (err) {
        console.error("Database connection middleware error:", err.message);
        next(err);
    }
});

app.get("/api/health", (req, res) => {
    res.json({success: true, status: "ok", service: "TTP CRM API"})
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

const start = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => 
            console.log(`TTP CRM API is running on port http://localhost:${PORT}`)
        );   
    } catch (error) {
        console.error("Failed to connect to the database", error);
    }
};

// Only bind to local port if run directly, not when imported by serverless handlers
const isMainModule = process.argv[1] && (
    fileURLToPath(import.meta.url) === path.resolve(process.argv[1]) ||
    process.argv[1].endsWith("server.js")
);

if (isMainModule && !process.env.VERCEL) {
    start();
}

export default app;