const express = require("express");
const {
  protect,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

const {
  getQuizMasters,
  getParticipants, // ✅ ADD THIS
} = require("../controllers/userController");

const router = express.Router();

// Get current user
router.get("/me", protect, (req, res) => {
  res.status(200).json({
    message: "Profile fetched successfully",
    user: req.user,
  });
});

// Get Quiz Masters
router.get(
  "/quiz-masters",
  protect,
  authorizeRoles("super_admin"),
  getQuizMasters
);

// ✅ ADD THIS ROUTE
router.get(
  "/participants",
  protect,
  authorizeRoles("super_admin"),
  getParticipants
);

// Test route
router.get(
  "/admin-only",
  protect,
  authorizeRoles("super_admin", "quiz_master"),
  (req, res) => {
    res.status(200).json({
      message: "Welcome Admin or Quiz Master",
      user: req.user,
    });
  }
);

module.exports = router;