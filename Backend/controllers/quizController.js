const Quiz = require("../models/Quiz");

// @desc    Create a new quiz
// @route   POST /api/quizzes
// @access  Private (super_admin, quiz_master)
const createQuiz = async (req, res) => {
  try {
    const { title, description, quizCode, status, startTime, endTime } = req.body;

    if (!title || !quizCode) {
      return res.status(400).json({
        message: "Title and quizCode are required",
      });
    }

    const existingQuiz = await Quiz.findOne({ quizCode: quizCode.toUpperCase() });

    if (existingQuiz) {
      return res.status(400).json({
        message: "Quiz already exists with this quiz code",
      });
    }

    const quiz = await Quiz.create({
      title,
      description,
      quizCode: quizCode.toUpperCase(),
      status: status || "draft",
      startTime: startTime || null,
      endTime: endTime || null,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      message: "Quiz created successfully",
      quiz,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while creating quiz",
      error: error.message,
    });
  }
};

// @desc    Get all quizzes
// @route   GET /api/quizzes
// @access  Private
const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find()
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Quizzes fetched successfully",
      count: quizzes.length,
      quizzes,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching quizzes",
      error: error.message,
    });
  }
};

// @desc    Get single quiz by ID
// @route   GET /api/quizzes/:id
// @access  Private
const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate(
      "createdBy",
      "name email role"
    );

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found",
      });
    }

    return res.status(200).json({
      message: "Quiz fetched successfully",
      quiz,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching quiz",
      error: error.message,
    });
  }
};

// @desc    Update quiz
// @route   PUT /api/quizzes/:id
// @access  Private (super_admin, quiz_master)
const updateQuiz = async (req, res) => {
  try {
    const { title, description, quizCode, status, startTime, endTime } = req.body;

    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found",
      });
    }

    if (quizCode && quizCode.toUpperCase() !== quiz.quizCode) {
      const existingQuiz = await Quiz.findOne({
        quizCode: quizCode.toUpperCase(),
        _id: { $ne: quiz._id },
      });

      if (existingQuiz) {
        return res.status(400).json({
          message: "Another quiz already uses this quiz code",
        });
      }
    }

    quiz.title = title || quiz.title;
    quiz.description = description !== undefined ? description : quiz.description;
    quiz.quizCode = quizCode ? quizCode.toUpperCase() : quiz.quizCode;
    quiz.status = status || quiz.status;
    quiz.startTime = startTime !== undefined ? startTime : quiz.startTime;
    quiz.endTime = endTime !== undefined ? endTime : quiz.endTime;

    const updatedQuiz = await quiz.save();

    return res.status(200).json({
      message: "Quiz updated successfully",
      quiz: updatedQuiz,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while updating quiz",
      error: error.message,
    });
  }
};

// @desc    Get quiz by quiz code
// @route   GET /api/quizzes/code/:quizCode
// @access  Private
const getQuizByCode = async (req, res) => {
  try {
    const { quizCode } = req.params;

    const quiz = await Quiz.findOne({
      quizCode: quizCode.toUpperCase(),
    }).populate("createdBy", "name email role");

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found with this code",
      });
    }

    if (quiz.status === "draft") {
      return res.status(403).json({
        message: "This quiz is not available yet",
      });
    }

    return res.status(200).json({
      message: "Quiz fetched successfully",
      quiz,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching quiz by code",
      error: error.message,
    });
  }
};

// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
// @access  Private (super_admin, quiz_master)
const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found",
      });
    }

    await quiz.deleteOne();

    return res.status(200).json({
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while deleting quiz",
      error: error.message,
    });
  }
};

module.exports = {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  getQuizByCode,
  updateQuiz,
  deleteQuiz,
};