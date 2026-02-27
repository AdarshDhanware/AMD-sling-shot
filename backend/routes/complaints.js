const express = require("express");
const router = express.Router();
const path = require("path");
const Complaint = require("../models/Complaint");
const { protect, adminOnly } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { analyzeComplaint } = require("../config/aiService");

// ============================================================
// STUDENT ENDPOINTS
// ============================================================

// @route   POST /api/complaints
// @desc    Create a new complaint + call AI service for analysis
// @access  Private (Student)
router.post("/", protect, upload.single("image"), async (req, res) => {
  try {
    const { description, location, block } = req.body;

    if (!description || description.length < 10) {
      return res.status(400).json({
        message: "Description must be at least 10 characters long",
      });
    }

    // Build imageUrl if image was uploaded
    const imageUrl = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      : null;

    // ============================================================
    // 🤖 AI ANALYSIS — calling AI service
    // The following fields will be populated with AI-generated output:
    //   category, priority, department, estimatedResolution, reasoning, riskScore
    // ============================================================
    let aiResult;
    try {
      aiResult = await analyzeComplaint(description, imageUrl);
    } catch (aiError) {
      console.error("AI analysis failed:", aiError.message);
      // Use safe defaults if AI fails completely
      aiResult = {
        category: "Others",
        priority: "Medium",
        department: "General Maintenance Dept.",
        estimatedResolution: "3-5 days",
        reasoning:
          "AI analysis temporarily unavailable. Manual review required.", // 🤖 AI Generated (unavailable)
        riskScore: 50,
        aiAnalysisRaw: null,
      };
    }

    // Create complaint with AI-generated fields embedded
    const complaint = await Complaint.create({
      userId: req.user._id,
      description,
      imageUrl,
      location: location || "",
      block: block || "",

      // 🤖 AI Generated fields — all values below come from AI analysis
      category: aiResult.category,
      priority: aiResult.priority,
      department: aiResult.department,
      estimatedResolution: aiResult.estimatedResolution,
      reasoning: aiResult.reasoning,
      riskScore: aiResult.riskScore,
      aiAnalysisRaw: aiResult.aiAnalysisRaw,
    });

    await complaint.populate("userId", "name email rollNumber");

    res.status(201).json({
      success: true,
      message: "Complaint submitted and analyzed by AI successfully",
      complaint,
      aiSource: aiResult.source, // Indicates if AI is "java-ai-service" or "built-in-ai"
    });
  } catch (error) {
    console.error("Create complaint error:", error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/complaints/user/:id
// @desc    Get all complaints for a specific user
// @access  Private
router.get("/user/:id", protect, async (req, res) => {
  try {
    // Students can only see their own complaints
    if (
      req.user.role !== "admin" &&
      req.user._id.toString() !== req.params.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { status, priority, category, page = 1, limit = 10 } = req.query;
    const filter = { userId: req.params.id };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    const skip = (page - 1) * limit;
    const total = await Complaint.countDocuments(filter);
    const complaints = await Complaint.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("userId", "name email rollNumber");

    res.json({
      complaints,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/complaints/my
// @desc    Get logged-in user's complaints
// @access  Private
router.get("/my", protect, async (req, res) => {
  try {
    const { status, priority, category, page = 1, limit = 10 } = req.query;
    const filter = { userId: req.user._id };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    const skip = (page - 1) * limit;
    const total = await Complaint.countDocuments(filter);
    const complaints = await Complaint.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ complaints, total, page: Number(page) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/complaints/:id
// @desc    Get single complaint by ID
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate(
      "userId",
      "name email rollNumber"
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Students can only see their own complaints
    if (
      req.user.role !== "admin" &&
      complaint.userId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================================
// ADMIN ENDPOINTS
// ============================================================

// @route   GET /api/complaints
// @desc    Get all complaints with filters (Admin only)
// @access  Private/Admin
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const {
      status,
      priority,
      category,
      assignedTo,
      search,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { block: { $regex: search, $options: "i" } },
      ];
    }

    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };
    const skip = (page - 1) * limit;
    const total = await Complaint.countDocuments(filter);

    const complaints = await Complaint.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate("userId", "name email rollNumber department");

    res.json({
      complaints,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PATCH /api/complaints/:id/status
// @desc    Update complaint status
// @access  Private/Admin
router.patch("/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Open", "Assigned", "In Progress", "Resolved", "Closed"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Valid values: ${validStatuses.join(", ")}`,
      });
    }

    const updateData = { status };
    if (status === "Resolved" || status === "Closed") {
      updateData.resolvedAt = new Date();
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate("userId", "name email");

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PATCH /api/complaints/:id/assign
// @desc    Assign technician to complaint
// @access  Private/Admin
router.patch("/:id/assign", protect, adminOnly, async (req, res) => {
  try {
    const { assignedTo } = req.body;

    if (!assignedTo) {
      return res.status(400).json({ message: "Technician name is required" });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        assignedTo,
        assignedAt: new Date(),
        status: "Assigned",
      },
      { new: true }
    ).populate("userId", "name email");

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/complaints/admin/analytics
// @desc    Get analytics data for admin dashboard
// @access  Private/Admin
router.get("/admin/analytics", protect, adminOnly, async (req, res) => {
  try {
    const [
      totalComplaints,
      openComplaints,
      resolvedComplaints,
      byCategory,
      byPriority,
      byStatus,
      recentByBlock,
    ] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: "Open" }),
      Complaint.countDocuments({ status: { $in: ["Resolved", "Closed"] } }),
      Complaint.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Complaint.aggregate([
        { $group: { _id: "$priority", count: { $sum: 1 } } },
      ]),
      Complaint.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Complaint.aggregate([
        { $match: { block: { $ne: "" } } },
        { $group: { _id: "$block", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
    ]);

    // Average resolution time (hours)
    const resolvedWithTime = await Complaint.find({
      resolvedAt: { $ne: null },
      createdAt: { $ne: null },
    }).select("createdAt resolvedAt");

    let avgResolutionHours = 0;
    if (resolvedWithTime.length > 0) {
      const totalHours = resolvedWithTime.reduce((acc, c) => {
        return (
          acc + (new Date(c.resolvedAt) - new Date(c.createdAt)) / 3600000
        );
      }, 0);
      avgResolutionHours = Math.round(totalHours / resolvedWithTime.length);
    }

    // Most frequent category
    const mostFrequentCategory =
      byCategory.length > 0 ? byCategory[0]._id : "N/A";

    // High priority count
    const highPriorityCount = await Complaint.countDocuments({
      priority: { $in: ["High", "Critical"] },
      status: { $nin: ["Resolved", "Closed"] },
    });

    res.json({
      summary: {
        totalComplaints,
        openComplaints,
        resolvedComplaints,
        highPriorityCount,
        avgResolutionHours,
        mostFrequentCategory,
      },
      byCategory,
      byPriority,
      byStatus,
      recentByBlock,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
