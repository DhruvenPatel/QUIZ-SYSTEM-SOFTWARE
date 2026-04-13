const User = require("../models/User");
const Quiz = require("../models/Quiz");

// @desc    Get all quiz masters with stats
// @route   GET /api/users/quiz-masters
// @access  Private (super_admin)
const getQuizMasters = async (req, res) => {
  try {
    const quizMasters = await User.find({ role: "quiz_master" })
      .select("_id name email role createdAt")
      .sort({ createdAt: -1 });

    const quizzes = await Quiz.find({}).select("_id createdBy").lean();

    const quizCountMap = {};

    for (const quiz of quizzes) {
      const creatorId = quiz?.createdBy?.toString();
      if (!creatorId) continue;
      quizCountMap[creatorId] = (quizCountMap[creatorId] || 0) + 1;
    }

    const formattedQuizMasters = quizMasters.map((user) => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      joinedAt: user.createdAt,
      quizzesCount: quizCountMap[user._id.toString()] || 0,
    }));

    const totalQuizMasters = formattedQuizMasters.length;
    const totalQuizzesCreated = formattedQuizMasters.reduce(
      (sum, item) => sum + item.quizzesCount,
      0
    );

    return res.status(200).json({
      success: true,
      stats: {
        totalQuizMasters,
        totalQuizzesCreated,
      },
      data: formattedQuizMasters,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch quiz masters",
      error: error.message,
    });
  }
};

// @desc    Get all participants
// @route   GET /api/users/participants
// @access  Private (super_admin)
const getParticipants = async (req, res) => {
  try {
    const participants = await User.find({ role: "participant" })
      .select("_id name email role createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      stats: {
        totalParticipants: participants.length,
      },
      data: participants.map((user) => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        joinedAt: user.createdAt,
      })),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch participants",
      error: error.message,
    });
  }
};

module.exports = {
  getQuizMasters,
  getParticipants,
};