const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback");
const Complaint = require("../models/Complaint");
const { protect, adminOnly } = require("../middleware/auth");

// @route   POST /api/feedback
// @desc    Submit feedback for a resolved complaint
// @access  Private (Student)
router.post("/", protect, async (req, res) => {
  try {
    const { complaintId, rating, comment } = req.body;

    if (!complaintId || !rating) {
      return res
        .status(400)
        .json({ message: "Complaint ID and rating are required" });
    }

    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Only the complaint owner can submit feedback
    if (complaint.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You can only submit feedback for your own complaints" });
    }

    // Check if feedback already submitted
    const existingFeedback = await Feedback.findOne({ complaintId, userId: req.user._id });
    if (existingFeedback) {
      return res
        .status(400)
        .json({ message: "Feedback already submitted for this complaint" });
    }

    const feedback = await Feedback.create({
      complaintId,
      userId: req.user._id,
      rating,
      comment: comment || "",
    });

    res.status(201).json({ success: true, feedback });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/feedback
// @desc    Get all feedback (Admin only)
// @access  Private/Admin
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate("complaintId", "description category priority")
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    const avgRating =
      feedbacks.length > 0
        ? (
            feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length
          ).toFixed(1)
        : 0;

    res.json({ feedbacks, avgRating, total: feedbacks.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/feedback/complaint/:id
// @desc    Get feedback for a specific complaint
// @access  Private
router.get("/complaint/:id", protect, async (req, res) => {
  try {
    const feedback = await Feedback.findOne({ complaintId: req.params.id })
      .populate("userId", "name");
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
