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

// ========================================
// CORS
// ========================================

const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "https://quizsoftware.vercel.app",
];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow Postman, server-to-server and requests
        // without an Origin header
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        console.log("❌ CORS blocked:", origin);

        return callback(new Error("Not allowed by CORS"));
    },

    credentials: true,

    methods: [
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS",
    ],

    allowedHeaders: [
        "Origin",
        "X-Requested-With",
        "Content-Type",
        "Accept",
        "Authorization",
    ],
};

// Apply CORS BEFORE routes
app.use(cors(corsOptions));

// Explicit OPTIONS handler
app.options("*", cors(corsOptions));


// ========================================
// BODY PARSER
// ========================================

app.use(express.json());


// ========================================
// ROOT
// ========================================

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Quiz System API is running...",
    });
});


// ========================================
// TEST
// ========================================

app.get("/api/test", (req, res) => {
    res.status(200).json({
        success: true,
        message: "API working fine",
    });
});


// ========================================
// API ROUTES
// ========================================

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/results", resultRoutes);


// ========================================
// 404
// ========================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found",
        path: req.originalUrl,
    });
});


// ========================================
// ERROR HANDLER
// ========================================

app.use((err, req, res, next) => {
    console.error("❌ Server Error:", err);

    if (err.message === "Not allowed by CORS") {
        return res.status(403).json({
            success: false,
            message: "CORS error",
        });
    }

    res.status(500).json({
        success: false,
        message: "Server error",
        error: err.message,
    });
});


// ========================================
// DATABASE CONNECTION
// ========================================

let isConnected = false;

const connectDatabase = async () => {
    if (isConnected) {
        return;
    }

    await connectDB();

    isConnected = true;

    console.log("✅ Database connected");
};


// ========================================
// VERCEL SERVERLESS HANDLER
// ========================================

module.exports = async (req, res) => {
    try {
        await connectDatabase();

        return app(req, res);
    } catch (error) {
        console.error("❌ Database connection failed:");
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Database connection failed",
            error: error.message,
        });
    }
};


// ========================================
// LOCAL DEVELOPMENT
// ========================================

if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 5001;
    const HOST = process.env.HOST || "127.0.0.1";

    connectDatabase()
        .then(() => {
            app.listen(PORT, HOST, () => {
                console.log("\n-----------------------------------");
                console.log("🚀 Quiz System API is running");
                console.log(`🌐 Local: http://${HOST}:${PORT}`);
                console.log(
                    `🧪 Test: http://${HOST}:${PORT}/api/test`
                );
                console.log("-----------------------------------\n");
            });
        })
        .catch((error) => {
            console.error(
                "❌ MongoDB connection failed:",
                error.message
            );

            process.exit(1);
        });
}
