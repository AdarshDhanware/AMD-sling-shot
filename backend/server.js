require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/complaints", require("./routes/complaints"));
app.use("/api/feedback", require("./routes/feedback"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "FixItAI Backend is running",
    timestamp: new Date().toISOString(),
    aiServiceUrl: process.env.AI_SERVICE_URL || "http://localhost:8081/ai/analyze",
  });
});

// Seed route (dev only) - creates admin + sample data
if (process.env.NODE_ENV === "development") {
  app.post("/api/seed", async (req, res) => {
    try {
      const User = require("./models/User");
      const Complaint = require("./models/Complaint");

      // Create admin
      let admin = await User.findOne({ email: "admin@fixitai.com" });
      if (!admin) {
        admin = await User.create({
          name: "Admin User",
          email: "admin@fixitai.com",
          password: "admin123",
          role: "admin",
        });
      }

      // Create student
      let student = await User.findOne({ email: "student@fixitai.com" });
      if (!student) {
        student = await User.create({
          name: "Ravi Kumar",
          email: "student@fixitai.com",
          password: "student123",
          role: "student",
          rollNumber: "CS2021001",
          department: "Computer Science",
        });
      }

      // Create sample complaints with AI-generated data
      const sampleComplaints = [
        {
          userId: student._id,
          description: "Water leaking from the pipe in bathroom on 3rd floor",
          category: "Plumbing",           // 🤖 AI Generated
          priority: "High",               // 🤖 AI Generated
          department: "Plumbing & Sanitation Dept.", // 🤖 AI Generated
          estimatedResolution: "1-2 days", // 🤖 AI Generated
          reasoning: "Water leakage detected with high urgency indicators. Immediate plumbing intervention required to prevent structural damage.", // 🤖 AI Generated
          riskScore: 75,                  // 🤖 AI Generated
          status: "Open",
          block: "Block B",
          location: "3rd Floor Bathroom",
        },
        {
          userId: student._id,
          description: "Classroom lights flickering and one tube light is not working",
          category: "Electrical",         // 🤖 AI Generated
          priority: "Medium",             // 🤖 AI Generated
          department: "Electrical Maintenance Dept.", // 🤖 AI Generated
          estimatedResolution: "3-5 days", // 🤖 AI Generated
          reasoning: "Electrical issue with medium risk. Flickering lights may indicate wiring problems. Needs inspection within 3-5 days.", // 🤖 AI Generated
          riskScore: 55,                  // 🤖 AI Generated
          status: "Assigned",
          assignedTo: "Rajesh (Electrician)",
          block: "Block A",
          location: "Room 204",
        },
        {
          userId: student._id,
          description: "Cracks appearing on the hostel room wall near window",
          category: "Civil",              // 🤖 AI Generated
          priority: "Medium",             // 🤖 AI Generated
          department: "Civil Engineering Dept.", // 🤖 AI Generated
          estimatedResolution: "3-5 days", // 🤖 AI Generated
          reasoning: "Civil damage identified. Wall cracks may indicate structural weakness. Engineering inspection recommended within 3-5 days.", // 🤖 AI Generated
          riskScore: 58,                  // 🤖 AI Generated
          status: "Resolved",
          assignedTo: "Civil Team",
          resolvedAt: new Date(),
          block: "Block C",
          location: "Room 301",
        },
      ];

      await Complaint.insertMany(sampleComplaints.map(c => ({ ...c })));

      res.json({
        message: "Seed data created successfully",
        credentials: {
          admin: { email: "admin@fixitai.com", password: "admin123" },
          student: { email: "student@fixitai.com", password: "student123" },
        },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 FixItAI Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🤖 AI Service URL: ${process.env.AI_SERVICE_URL || "http://localhost:8081/ai/analyze"}`);
});
