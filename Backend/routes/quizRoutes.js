const express = require("express");
const {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  getQuizByCode,
  updateQuiz,
  deleteQuiz,
} = require("../controllers/quizController");
const {
  protect,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

const router = express.Router();

router
  .route("/")
  .post(protect, authorizeRoles("super_admin", "quiz_master"), createQuiz)
  .get(protect, getAllQuizzes);

router.route("/code/:quizCode").get(protect, getQuizByCode);

router
  .route("/:id")
  .get(protect, getQuizById)
  .put(protect, authorizeRoles("super_admin", "quiz_master"), updateQuiz)
  .delete(protect, authorizeRoles("super_admin", "quiz_master"), deleteQuiz);

module.exports = router;