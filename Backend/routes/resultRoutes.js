const express = require("express");
const router = express.Router();

const {
  getLeaderboard,
  getMyResult,
  getQuizSummary,
  getMyQuizzes,
  forceEndQuiz,
} = require("../controllers/resultController");

const { protect, authorizeRoles } = require("../middlewares/authMiddleware");

router.get(
  "/my-quizzes",
  protect,
  authorizeRoles("participant"),
  getMyQuizzes
);

router.get("/my/:quizId", protect, getMyResult);

router.get("/leaderboard/:quizId", protect, getLeaderboard);

router.get(
  "/summary/:quizId",
  protect,
  authorizeRoles("super_admin", "quiz_master"),
  getQuizSummary
);

router.post(
  "/force-end/:quizId",
  protect,
  authorizeRoles("participant"),
  forceEndQuiz
);

module.exports = router;