const Question = require("../models/Question");
const Quiz = require("../models/Quiz");

// @desc    Create a new question
// @route   POST /api/questions
// @access  Private (super_admin, quiz_master)
const createQuestion = async (req, res) => {
  try {
    const {
      quizId,
      questionText,
      questionType,
      options,
      correctAnswer,
      marks,
      negativeMarks,
      timeLimit,
      order,
    } = req.body;

    if (!quizId || !questionText || !questionType || !correctAnswer || !order) {
      return res.status(400).json({
        message:
          "quizId, questionText, questionType, correctAnswer, and order are required",
      });
    }

    const quizExists = await Quiz.findById(quizId);

    if (!quizExists) {
      return res.status(404).json({
        message: "Quiz not found",
      });
    }

    if (
      (questionType === "mcq" || questionType === "true_false") &&
      (!options || options.length < 2)
    ) {
      return res.status(400).json({
        message: "At least 2 options are required for MCQ or True/False questions",
      });
    }

    const existingQuestionOrder = await Question.findOne({ quizId, order });

    if (existingQuestionOrder) {
      return res.status(400).json({
        message: "A question with this order already exists in this quiz",
      });
    }

    const question = await Question.create({
      quizId,
      questionText,
      questionType,
      options: options || [],
      correctAnswer,
      marks: marks || 1,
      negativeMarks: negativeMarks || 0,
      timeLimit: timeLimit || 30,
      order,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      message: "Question created successfully",
      question,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while creating question",
      error: error.message,
    });
  }
};

// @desc    Get all questions for a quiz
// @route   GET /api/questions/quiz/:quizId
// @access  Private
const getQuestionsByQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    const questions = await Question.find({ quizId })
      .populate("quizId", "title quizCode status")
      .populate("createdBy", "name email role")
      .sort({ order: 1 });

    return res.status(200).json({
      message: "Questions fetched successfully",
      count: questions.length,
      questions,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching questions",
      error: error.message,
    });
  }
};

// @desc    Get single question by ID
// @route   GET /api/questions/:id
// @access  Private
const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate("quizId", "title quizCode status")
      .populate("createdBy", "name email role");

    if (!question) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    return res.status(200).json({
      message: "Question fetched successfully",
      question,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching question",
      error: error.message,
    });
  }
};

// @desc    Update question
// @route   PUT /api/questions/:id
// @access  Private (super_admin, quiz_master)
const updateQuestion = async (req, res) => {
  try {
    const {
      questionText,
      questionType,
      options,
      correctAnswer,
      marks,
      negativeMarks,
      timeLimit,
      order,
    } = req.body;

    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    const finalQuestionType = questionType || question.questionType;
    const finalOrder = order || question.order;

    if (
      (finalQuestionType === "mcq" || finalQuestionType === "true_false") &&
      options &&
      options.length < 2
    ) {
      return res.status(400).json({
        message: "At least 2 options are required for MCQ or True/False questions",
      });
    }

    if (finalOrder !== question.order) {
      const existingQuestionOrder = await Question.findOne({
        quizId: question.quizId,
        order: finalOrder,
        _id: { $ne: question._id },
      });

      if (existingQuestionOrder) {
        return res.status(400).json({
          message: "Another question with this order already exists in this quiz",
        });
      }
    }

    question.questionText = questionText || question.questionText;
    question.questionType = finalQuestionType;
    question.options = options !== undefined ? options : question.options;
    question.correctAnswer = correctAnswer || question.correctAnswer;
    question.marks = marks !== undefined ? marks : question.marks;
    question.negativeMarks =
      negativeMarks !== undefined ? negativeMarks : question.negativeMarks;
    question.timeLimit = timeLimit !== undefined ? timeLimit : question.timeLimit;
    question.order = finalOrder;

    const updatedQuestion = await question.save();

    return res.status(200).json({
      message: "Question updated successfully",
      question: updatedQuestion,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while updating question",
      error: error.message,
    });
  }
};

// @desc    Get participant-safe questions for a quiz
// @route   GET /api/questions/participant/:quizId
// @access  Private
const getParticipantQuestionsByQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found",
      });
    }

    if (quiz.status === "draft") {
      return res.status(403).json({
        message: "This quiz is not available yet",
      });
    }

    const questions = await Question.find({ quizId })
      .select("_id quizId questionText questionType options marks negativeMarks timeLimit order")
      .sort({ order: 1 });

    return res.status(200).json({
      message: "Participant questions fetched successfully",
      count: questions.length,
      questions,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching participant questions",
      error: error.message,
    });
  }
};

// @desc    Delete question
// @route   DELETE /api/questions/:id
// @access  Private (super_admin, quiz_master)
const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    await question.deleteOne();

    return res.status(200).json({
      message: "Question deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while deleting question",
      error: error.message,
    });
  }
};

module.exports = {
  createQuestion,
  getQuestionsByQuiz,
  getParticipantQuestionsByQuiz,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
};