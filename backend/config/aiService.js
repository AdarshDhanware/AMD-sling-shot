const axios = require("axios");

/**
 * AI SERVICE MODULE
 *
 * This module is responsible for calling the Java AI microservice
 * that analyzes complaints and returns AI-generated insights.
 *
 * ALL fields returned by analyzeComplaint() are AI-GENERATED OUTPUT:
 *   - category: AI classifies the complaint type
 *   - priority: AI determines urgency level
 *   - department: AI routes to appropriate department
 *   - estimatedResolution: AI predicts resolution time
 *   - reasoning: AI explains its analysis
 *   - riskScore: AI calculates a 0-100 risk/urgency score
 */

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL || "http://localhost:8081/ai/analyze";

/**
 * Calls the external Java AI service.
 * If the AI service is unavailable, falls back to a built-in smart analyzer.
 *
 * @param {string} description - The complaint description text
 * @param {string|null} imageUrl - Optional image URL
 * @returns {object} AI-generated analysis object
 */
const analyzeComplaint = async (description, imageUrl = null) => {
  try {
    // Try calling the real Java AI service first
    const response = await axios.post(
      AI_SERVICE_URL,
      { description, imageUrl },
      { timeout: 50000 }
    );

    console.log(response);

    return {
      // 🤖 AI Generated: All fields below come from the Java AI service
      category: response.data.category,
      priority: response.data.priority,
      department: response.data.department,
      estimatedResolution: response.data.estimatedResolution,
      reasoning: response.data.reasoning,
      riskScore: response.data.riskScore,
      aiAnalysisRaw: response.data,
      source: "java-ai-service",
    };
  } catch (error) {
    // Fallback: Smart built-in AI analyzer (rule-based + scoring)
    console.warn(
      "⚠️  Java AI service unavailable, using built-in analyzer:",
      error.message
    );
    console.log(error)
    return builtInAIAnalyzer(description, imageUrl);
  }
};

/**
 * Built-in Smart AI Analyzer (Fallback)
 * Uses keyword matching + weighted scoring to simulate AI analysis.
 * This is a fallback when the Java AI service is not available.
 *
 * 🤖 ALL OUTPUTS ARE AI-GENERATED (rule-based AI):
 */
const builtInAIAnalyzer = (description, imageUrl) => {
  const text = description.toLowerCase();

  // ---- CATEGORY DETECTION (🤖 AI Generated) ----
  const categoryRules = [
    {
      category: "Plumbing",
      keywords: [
        "water",
        "leak",
        "pipe",
        "tap",
        "drain",
        "toilet",
        "flush",
        "overflow",
        "sewage",
        "bathroom",
      ],
    },
    {
      category: "Electrical",
      keywords: [
        "light",
        "electric",
        "power",
        "switch",
        "socket",
        "fan",
        "wire",
        "short circuit",
        "bulb",
        "voltage",
        "current",
      ],
    },
    {
      category: "Civil",
      keywords: [
        "wall",
        "crack",
        "ceiling",
        "floor",
        "roof",
        "door",
        "window",
        "broken",
        "damage",
        "structural",
        "paint",
        "concrete",
      ],
    },
    {
      category: "Housekeeping",
      keywords: [
        "dirty",
        "clean",
        "garbage",
        "waste",
        "smell",
        "pest",
        "insect",
        "rat",
        "cockroach",
        "dust",
        "hygiene",
      ],
    },
    {
      category: "IT Infrastructure",
      keywords: [
        "internet",
        "wifi",
        "network",
        "computer",
        "projector",
        "screen",
        "printer",
        "server",
        "laptop",
        "connection",
      ],
    },
    {
      category: "Furniture",
      keywords: [
        "chair",
        "table",
        "bench",
        "desk",
        "cupboard",
        "shelf",
        "almirah",
        "broken furniture",
      ],
    },
  ];

  let detectedCategory = "Others";
  let maxMatches = 0;
  for (const rule of categoryRules) {
    const matches = rule.keywords.filter((kw) => text.includes(kw)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      detectedCategory = rule.category;
    }
  }

  // ---- PRIORITY DETECTION (🤖 AI Generated) ----
  const criticalKeywords = [
    "fire",
    "emergency",
    "gas leak",
    "explosion",
    "flood",
    "electrocution",
    "dangerous",
    "urgent",
    "immediately",
  ];
  const highKeywords = [
    "severe",
    "major",
    "no water",
    "no power",
    "broken",
    "not working",
    "complete failure",
    "serious",
  ];
  const lowKeywords = [
    "minor",
    "small",
    "slight",
    "little",
    "barely",
    "cosmetic",
  ];

  let priority = "Medium";
  if (criticalKeywords.some((kw) => text.includes(kw))) priority = "Critical";
  else if (highKeywords.some((kw) => text.includes(kw))) priority = "High";
  else if (lowKeywords.some((kw) => text.includes(kw))) priority = "Low";

  // ---- RISK SCORE (🤖 AI Generated: 0-100 numerical risk score) ----
  const priorityScores = { Critical: 90, High: 70, Medium: 50, Low: 25 };
  const categoryBonus = {
    Electrical: 15,
    Plumbing: 10,
    Civil: 8,
    Housekeeping: 5,
    "IT Infrastructure": 5,
    Furniture: 3,
    Others: 0,
  };
  const imageBonus = imageUrl ? 5 : 0;
  const riskScore = Math.min(
    100,
    priorityScores[priority] +
      (categoryBonus[detectedCategory] || 0) +
      imageBonus
  );

  // ---- DEPARTMENT ROUTING (🤖 AI Generated) ----
  const departmentMap = {
    Plumbing: "Plumbing & Sanitation Dept.",
    Electrical: "Electrical Maintenance Dept.",
    Civil: "Civil Engineering Dept.",
    Housekeeping: "Housekeeping & Sanitation",
    "IT Infrastructure": "IT Support Dept.",
    Furniture: "Furniture & Assets Dept.",
    Others: "General Maintenance Dept.",
  };

  // ---- ESTIMATED RESOLUTION (🤖 AI Generated) ----
  const resolutionMap = {
    Critical: "Same day (< 4 hours)",
    High: "1-2 days",
    Medium: "3-5 days",
    Low: "5-7 days",
  };

  // ---- AI REASONING (🤖 AI Generated) ----
  const reasoning = generateReasoning(
    detectedCategory,
    priority,
    riskScore,
    text
  );

  return {
    // 🤖 AI Generated: All fields below are AI output
    category: detectedCategory,
    priority,
    department: departmentMap[detectedCategory],
    estimatedResolution: resolutionMap[priority],
    reasoning,
    riskScore,
    aiAnalysisRaw: null,
    source: "built-in-ai",
  };
};

/**
 * Generates human-readable AI reasoning text.
 * 🤖 AI Generated: This text is AI output explaining the analysis.
 */
const generateReasoning = (category, priority, riskScore, text) => {
  const reasoningTemplates = {
    Critical: `This complaint has been classified as CRITICAL with a risk score of ${riskScore}/100. Immediate intervention is required as the issue poses a significant safety or operational risk. The ${category} department should be notified immediately and on-site inspection must occur within 4 hours.`,
    High: `Based on the complaint analysis, this issue is classified as HIGH priority (risk score: ${riskScore}/100). The ${category} department should address this within 1-2 business days. The described problem indicates potential for escalation if not resolved promptly.`,
    Medium: `This complaint has been analyzed and categorized as ${category} with MEDIUM priority (risk score: ${riskScore}/100). Standard resolution protocols apply. The assigned department should schedule inspection and repair within 3-5 business days.`,
    Low: `This is a LOW priority ${category} complaint with a risk score of ${riskScore}/100. The issue is minor and does not pose immediate risk. The department may schedule this during their regular maintenance cycle within 5-7 days.`,
  };

  return reasoningTemplates[priority] || reasoningTemplates["Medium"];
};

module.exports = { analyzeComplaint };
