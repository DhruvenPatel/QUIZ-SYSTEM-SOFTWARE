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

// ============================================
// CORS
// ============================================

const corsOptions = {
    origin: "https://quizsoftware.vercel.app",

    methods: [
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS",
    ],

    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "Accept",
        "Origin",
        "X-Requested-With",
    ],

    credentials: true,

    optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));


// ============================================
// JSON
// ============================================

app.use(express.json());


// ============================================
// TEST
// ============================================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Quiz System API is running",
    });
});

app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "API working fine",
    });
});


// ============================================
// ROUTES
// ============================================

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/results", resultRoutes);


// ============================================
// 404
// ============================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
        path: req.originalUrl,
    });
});


// ============================================
// ERROR HANDLER
// ============================================

app.use((err, req, res, next) => {
    console.error("SERVER ERROR:", err);

    res.status(500).json({
        success: false,
        message: "Server error",
        error: err.message,
    });
});


// ============================================
// DATABASE
// ============================================

let dbConnected = false;

async function initializeDatabase() {
    if (dbConnected) {
        return;
    }

    await connectDB();

    dbConnected = true;

    console.log("MongoDB connected");
}


// ============================================
// VERCEL HANDLER
// ============================================

const handler = async (req, res) => {
    try {
        await initializeDatabase();

        return app(req, res);
    } catch (error) {
        console.error("DATABASE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Database connection failed",
            error: error.message,
        });
    }
};

module.exports = handler;


// ============================================
// LOCAL DEVELOPMENT
// ============================================

if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 5001;

    initializeDatabase()
        .then(() => {
            app.listen(PORT, () => {
                console.log(
                    `Quiz System API running on http://localhost:${PORT}`
                );
            });
        })
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}
