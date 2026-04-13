const express = require("express");
const {
  createQuestion,
  getQuestionsByQuiz,
  getParticipantQuestionsByQuiz,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
} = require("../controllers/questionController");
const {
  protect,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

const router = express.Router();

router
  .route("/")
  .post(protect, authorizeRoles("super_admin", "quiz_master"), createQuestion);

router.route("/quiz/:quizId").get(protect, getQuestionsByQuiz);

router.route("/participant/:quizId").get(protect, getParticipantQuestionsByQuiz);

router
  .route("/:id")
  .get(protect, getQuestionById)
  .put(protect, authorizeRoles("super_admin", "quiz_master"), updateQuestion)
  .delete(protect, authorizeRoles("super_admin", "quiz_master"), deleteQuestion);

module.exports = router;