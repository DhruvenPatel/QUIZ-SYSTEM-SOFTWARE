const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const quizRoutes = require("./routes/quizRoutes");
const questionRoutes = require("./routes/questionRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const resultRoutes = require("./routes/resultRoutes");

dotenv.config();

const app = express();

// ================================
// CORS CONFIGURATION
// ================================

const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "https://quizsoftware.vercel.app/",
];

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests without an origin
            // (Postman, mobile apps, server-to-server requests)
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            console.log("❌ CORS blocked origin:", origin);

            return callback(
                new Error(`CORS policy blocked this origin: ${origin}`)
            );
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: [
            "Origin",
            "X-Requested-With",
            "Content-Type",
            "Accept",
            "Authorization",
        ],
    })
);

// Handle preflight requests
app.options("*", cors());


// ================================
// BODY PARSER
// ================================

app.use(express.json());


// ================================
// ROOT ROUTE
// ================================

app.get("/", (req, res) => {
    console.log("Root route hit");

    res.status(200).json({
        success: true,
        message: "Quiz System API is running...",
    });
});


// ================================
// TEST ROUTE
// ================================

app.get("/api/test", (req, res) => {
    console.log("Test API hit");

    res.status(200).json({
        success: true,
        message: "API working fine",
    });
});


// ================================
// API ROUTES
// ================================

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/results", resultRoutes);


// ================================
// 404 HANDLER
// ================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found",
        path: req.originalUrl,
    });
});


// ================================
// ERROR HANDLER
// ================================

app.use((err, req, res, next) => {
    console.error("❌ Server Error:", err.message);

    if (err.message && err.message.startsWith("CORS policy blocked")) {
        return res.status(403).json({
            success: false,
            message: "CORS error",
            error: err.message,
        });
    }

    res.status(500).json({
        success: false,
        message: "Server error",
        error: err.message,
    });
});


// ================================
// SERVER START
// ================================

const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || "127.0.0.1";


// Start server ONLY after MongoDB connects
const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, HOST, () => {
            console.log("\n-----------------------------------");
            console.log("🚀 Quiz System API is running");
            console.log(`🌐 Local: http://${HOST}:${PORT}`);
            console.log(`🧪 Test: http://${HOST}:${PORT}/api/test`);
            console.log("-----------------------------------\n");
        });
    } catch (error) {
        console.error("\n❌ MongoDB connection failed.");
        console.error("Error:", error.message);
        console.error("\n⚠️ Server was NOT started.\n");

        process.exit(1);
    }
};

startServer();
