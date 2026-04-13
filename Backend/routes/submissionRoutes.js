const express = require("express");
const {
  submitAnswer,
  getMySubmissions,
  getQuizSubmissions,
} = require("../controllers/submissionController");
const {
  protect,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

const router = express.Router();

router
  .route("/")
  .post(
    protect,
    authorizeRoles("participant", "quiz_master", "super_admin"),
    submitAnswer
  );

router.route("/my").get(protect, getMySubmissions);

router
  .route("/quiz/:quizId")
  .get(protect, authorizeRoles("super_admin", "quiz_master"), getQuizSubmissions);

module.exports = router;