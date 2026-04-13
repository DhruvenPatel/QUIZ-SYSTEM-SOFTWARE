const Submission = require("../models/Submission");
const Question = require("../models/Question");
const Quiz = require("../models/Quiz");

// @desc    Submit answer for a question
// @route   POST /api/submissions
// @access  Private (participant, quiz_master, super_admin)
const submitAnswer = async (req, res) => {
  try {
    const { quizId, questionId, selectedAnswer } = req.body;

    if (!quizId || !questionId || !selectedAnswer) {
      return res.status(400).json({
        message: "quizId, questionId, and selectedAnswer are required",
      });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found",
      });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    if (question.quizId.toString() !== quizId) {
      return res.status(400).json({
        message: "Question does not belong to this quiz",
      });
    }

    const existingSubmission = await Submission.findOne({
      quizId,
      questionId,
      participantId: req.user._id,
    });

    if (existingSubmission) {
      return res.status(400).json({
        message: "You have already submitted an answer for this question",
      });
    }

    const normalizedSelected =
      selectedAnswer.toString().trim().toLowerCase();
    const normalizedCorrect =
      question.correctAnswer.toString().trim().toLowerCase();

    const isCorrect = normalizedSelected === normalizedCorrect;
    const marksAwarded = isCorrect ? question.marks : -question.negativeMarks;

    const submission = await Submission.create({
      quizId,
      questionId,
      participantId: req.user._id,
      selectedAnswer,
      isCorrect,
      marksAwarded,
    });

    return res.status(201).json({
      message: "Answer submitted successfully",
      submission,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while submitting answer",
      error: error.message,
    });
  }
};

// @desc    Get logged-in participant's submissions
// @route   GET /api/submissions/my
// @access  Private
const getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({
      participantId: req.user._id,
    })
      .populate("quizId", "title quizCode status")
      .populate("questionId", "questionText questionType options correctAnswer marks")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "My submissions fetched successfully",
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching your submissions",
      error: error.message,
    });
  }
};

// @desc    Get all submissions for a quiz
// @route   GET /api/submissions/quiz/:quizId
// @access  Private (super_admin, quiz_master)
const getQuizSubmissions = async (req, res) => {
  try {
    const { quizId } = req.params;

    const submissions = await Submission.find({ quizId })
      .populate("participantId", "name email role")
      .populate("questionId", "questionText correctAnswer marks negativeMarks")
      .populate("quizId", "title quizCode status")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Quiz submissions fetched successfully",
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching quiz submissions",
      error: error.message,
    });
  }
};

module.exports = {
  submitAnswer,
  getMySubmissions,
  getQuizSubmissions,
};