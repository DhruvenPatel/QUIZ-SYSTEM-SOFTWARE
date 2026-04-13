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
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  console.log("Root route hit");
  res.send("Quiz System API is running...");
});

app.get("/api/test", (req, res) => {
  console.log("Test API hit");
  res.json({ message: "API working fine" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/results", resultRoutes);

const PORT = process.env.PORT || 5001;
const HOST = "127.0.0.1";

app.listen(PORT, HOST, () => {
  console.log("\n-----------------------------------");
  console.log("🚀 Quiz System API is running");
  console.log(`🌐 Local: http://${HOST}:${PORT}`);
  console.log("-----------------------------------\n");
});