const Submission = require("../models/Submission");
const Quiz = require("../models/Quiz");
const Question = require("../models/Question");
const Result = require("../models/Result");

// @desc    Force end quiz for participant due to violation
// @route   POST /api/results/force-end/:quizId
// @access  Private (participant)
const forceEndQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { reason } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found",
      });
    }

    const existingResult = await Result.findOne({
      participant: req.user._id,
      quiz: quizId,
    });

    if (existingResult) {
      return res.status(200).json({
        message: "Quiz already ended for this participant",
        result: existingResult,
      });
    }

    const submissions = await Submission.find({
      quizId,
      participantId: req.user._id,
    }).populate(
      "questionId",
      "questionText questionType options correctAnswer marks negativeMarks"
    );

    const totalScore = submissions.reduce(
      (sum, item) => sum + (item.marksAwarded || 0),
      0
    );

    const totalQuestions = await Question.countDocuments({ quizId });

    const answers = submissions.map((item) => ({
      question: item.questionId?._id || item.questionId,
      selectedAnswer: item.selectedAnswer || "",
      correctAnswer: item.questionId?.correctAnswer || "",
      isCorrect: item.isCorrect || false,
    }));

    const percentage =
      totalQuestions > 0 ? Number(((answers.length / totalQuestions) * 100).toFixed(2)) : 0;

    const result = await Result.create({
      participant: req.user._id,
      quiz: quizId,
      answers,
      score: totalScore,
      totalQuestions,
      percentage,
      status: "terminated",
      terminatedReason: reason || "Quiz ended due to security policy violation.",
    });

    return res.status(201).json({
      message: "Quiz ended successfully due to violation",
      result,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while force ending quiz",
      error: error.message,
    });
  }
};

// @desc    Get quizzes attempted by logged in participant
// @route   GET /api/results/my-quizzes
// @access  Private (participant)
const getMyQuizzes = async (req, res) => {
  try {
    const participantId = req.user._id;

    const quizzes = await Submission.aggregate([
      {
        $match: {
          participantId: participantId,
        },
      },
      {
        $group: {
          _id: "$quizId",
          totalScore: { $sum: "$marksAwarded" },
          totalAttempts: { $sum: 1 },
          correctAnswers: {
            $sum: {
              $cond: ["$isCorrect", 1, 0],
            },
          },
          wrongAnswers: {
            $sum: {
              $cond: ["$isCorrect", 0, 1],
            },
          },
          attemptedAt: { $max: "$createdAt" },
        },
      },
      {
        $sort: {
          attemptedAt: -1,
        },
      },
      {
        $lookup: {
          from: "quizzes",
          localField: "_id",
          foreignField: "_id",
          as: "quiz",
        },
      },
      {
        $unwind: "$quiz",
      },
      {
        $lookup: {
          from: "results",
          let: { quizId: "$quiz._id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$quiz", "$$quizId"] },
                    { $eq: ["$participant", participantId] },
                  ],
                },
              },
            },
          ],
          as: "resultInfo",
        },
      },
      {
        $project: {
          _id: 0,
          resultId: "$_id",
          quizId: "$quiz._id",
          title: "$quiz.title",
          quizCode: "$quiz.quizCode",
          status: "$quiz.status",
          totalScore: 1,
          totalAttempts: 1,
          correctAnswers: 1,
          wrongAnswers: 1,
          attemptedAt: 1,
          quizResultStatus: {
            $ifNull: [{ $arrayElemAt: ["$resultInfo.status", 0] }, "completed"],
          },
          terminatedReason: {
            $ifNull: [{ $arrayElemAt: ["$resultInfo.terminatedReason", 0] }, ""],
          },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      count: quizzes.length,
      quizzes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch participant quizzes",
      error: error.message,
    });
  }
};

// @desc    Get leaderboard for a quiz
// @route   GET /api/results/leaderboard/:quizId
// @access  Private
const getLeaderboard = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found",
      });
    }

    const leaderboard = await Submission.aggregate([
      {
        $match: {
          quizId: quiz._id,
        },
      },
      {
        $group: {
          _id: "$participantId",
          totalScore: { $sum: "$marksAwarded" },
          totalAttempts: { $sum: 1 },
          correctAnswers: {
            $sum: {
              $cond: ["$isCorrect", 1, 0],
            },
          },
          wrongAnswers: {
            $sum: {
              $cond: ["$isCorrect", 0, 1],
            },
          },
        },
      },
      {
        $sort: {
          totalScore: -1,
          correctAnswers: -1,
          totalAttempts: 1,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "participant",
        },
      },
      {
        $unwind: "$participant",
      },
      {
        $project: {
          _id: 0,
          participantId: "$participant._id",
          name: "$participant.name",
          email: "$participant.email",
          role: "$participant.role",
          totalScore: 1,
          totalAttempts: 1,
          correctAnswers: 1,
          wrongAnswers: 1,
        },
      },
    ]);

    const rankedLeaderboard = leaderboard.map((item, index) => ({
      rank: index + 1,
      ...item,
    }));

    return res.status(200).json({
      message: "Leaderboard fetched successfully",
      quiz: {
        id: quiz._id,
        title: quiz.title,
        quizCode: quiz.quizCode,
        status: quiz.status,
      },
      count: rankedLeaderboard.length,
      leaderboard: rankedLeaderboard,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching leaderboard",
      error: error.message,
    });
  }
};

// @desc    Get my result for a specific quiz
// @route   GET /api/results/my/:quizId
// @access  Private
const getMyResult = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found",
      });
    }

    const existingResult = await Result.findOne({
      participant: req.user._id,
      quiz: quizId,
    });

    if (existingResult) {
      return res.status(200).json({
        message: "My result fetched successfully",
        quiz: {
          id: quiz._id,
          title: quiz.title,
          quizCode: quiz.quizCode,
          status: quiz.status,
        },
        participant: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
        },
        result: {
          totalScore: existingResult.score,
          totalAttempts: existingResult.answers.length,
          correctAnswers: existingResult.answers.filter((a) => a.isCorrect).length,
          wrongAnswers: existingResult.answers.filter((a) => !a.isCorrect).length,
          status: existingResult.status,
          terminatedReason: existingResult.terminatedReason || "",
        },
        submissions: existingResult.answers,
      });
    }

    const submissions = await Submission.find({
      quizId,
      participantId: req.user._id,
    })
      .populate(
        "questionId",
        "questionText questionType options correctAnswer marks negativeMarks"
      )
      .sort({ createdAt: 1 });

    if (!submissions || submissions.length === 0) {
      return res.status(404).json({
        message: "You have not attempted this quiz yet",
      });
    }

    const totalScore = submissions.reduce(
      (sum, item) => sum + (item.marksAwarded || 0),
      0
    );
    const totalAttempts = submissions.length;
    const correctAnswers = submissions.filter((item) => item.isCorrect).length;
    const wrongAnswers = totalAttempts - correctAnswers;

    return res.status(200).json({
      message: "My result fetched successfully",
      quiz: {
        id: quiz._id,
        title: quiz.title,
        quizCode: quiz.quizCode,
        status: quiz.status,
      },
      participant: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
      result: {
        totalScore,
        totalAttempts,
        correctAnswers,
        wrongAnswers,
        status: "completed",
        terminatedReason: "",
      },
      submissions,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching your result",
      error: error.message,
    });
  }
};

// @desc    Get quiz summary
// @route   GET /api/results/summary/:quizId
// @access  Private (super_admin, quiz_master)
const getQuizSummary = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId).populate(
      "createdBy",
      "name email role"
    );

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found",
      });
    }

    const totalQuestions = await Question.countDocuments({ quizId });
    const totalSubmissions = await Submission.countDocuments({ quizId });

    const participantStats = await Submission.aggregate([
      {
        $match: {
          quizId: quiz._id,
        },
      },
      {
        $group: {
          _id: "$participantId",
          totalScore: { $sum: "$marksAwarded" },
        },
      },
      {
        $sort: {
          totalScore: -1,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "participant",
        },
      },
      {
        $unwind: "$participant",
      },
      {
        $project: {
          _id: 0,
          participantId: "$participant._id",
          name: "$participant.name",
          email: "$participant.email",
          totalScore: 1,
        },
      },
    ]);

    const totalParticipants = participantStats.length;
    const topScorer = participantStats.length > 0 ? participantStats[0] : null;

    return res.status(200).json({
      message: "Quiz summary fetched successfully",
      quiz: {
        id: quiz._id,
        title: quiz.title,
        quizCode: quiz.quizCode,
        status: quiz.status,
        createdBy: quiz.createdBy,
        startTime: quiz.startTime,
        endTime: quiz.endTime,
      },
      summary: {
        totalQuestions,
        totalSubmissions,
        totalParticipants,
        topScorer,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching quiz summary",
      error: error.message,
    });
  }
};

module.exports = {
  getLeaderboard,
  getMyResult,
  getQuizSummary,
  getMyQuizzes,
  forceEndQuiz,
};