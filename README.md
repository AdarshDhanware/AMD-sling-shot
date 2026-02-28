# 🔧 FixItAI – AI-Powered Campus Complaint & Maintenance Tracker

> Smart. Transparent. Ethical. — A hackathon-ready AI system that transforms how students report campus issues and how admins resolve them.

---

## 🚨 Problem Statement

Campus maintenance is broken. Here's what actually happens today:

- A student finds a leaking pipe, broken AC, or faulty light.
- They send a WhatsApp message to someone who may or may not forward it.
- Or they fill out a physical form that sits on a desk.
- Or they email an admin who has 200 other emails.
- Nobody knows the status. The issue might get fixed. It might not.

**The result:** Students are frustrated. Admins are overwhelmed. Issues pile up. High-priority safety hazards get treated the same as low-priority requests.

There is no smart system. There is no transparency. There is no accountability.

---

## 💡 What is FixItAI?

FixItAI is an AI-powered campus complaint and maintenance tracking system that allows students to report issues in natural language (with optional photo), and automatically:

- **Classifies** the complaint into the right category (Electrical, Plumbing, Network, Housekeeping, etc.)
- **Determines priority** — High, Medium, or Low — based on safety and impact
- **Assigns** the responsible department automatically
- **Estimates** resolution time
- **Explains its reasoning** — so students and admins understand *why* an AI made a decision
- **Tracks patterns** — repeated complaints trigger preventive maintenance suggestions
- **Learns from feedback** — student ratings improve future prioritization

Admins get a smart dashboard with analytics, heatmaps, trend predictions, and workload distribution tools.

---

## ✨ Key Features

### 1. 🧠 Transparent AI Reasoning
The AI doesn't just classify — it explains itself.

> *"Priority HIGH because complaint mentions 'leak' and 'floor slippery' → safety hazard. Assigned to Plumbing/Maintenance because keywords indicate water-related issue."*

This builds trust, promotes ethical AI, and helps admins make better decisions.

---

### 2. 📊 Behavior-Aware Routing
The AI tracks historical complaint patterns and adapts:

> *"Multiple AC complaints in Block B → suggest general AC maintenance check this week."*

Repeated issues trigger preventive action suggestions automatically.

---

### 3. ⚖️ Ethical & Safety Scoring
Each complaint receives a risk/safety score using a transparent formula:

```
riskScore = (safetyHazard × 0.6) + (disruptionImpact × 0.3) + (recurrence × 0.1)
```

High-risk complaints are escalated faster. The formula is visible to admins — no black-box decisions.

---

### 4. ⭐ Student Feedback Loop
Students rate resolution quality (1–5 stars). The AI uses this data to:

- Track performance trends per department
- Adjust future prioritization logic
- Hold departments accountable

---

### 5. 📈 Visual Dashboard & Predictive Analytics
Admin dashboard includes:

- Total complaints, average resolution time
- Trend charts by category and block
- AI-generated preventive suggestions



---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js + Tailwind CSS |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **AI ** | Open router Models |
| **File Upload** | Multer (complaint photos) |
| **Authentication** | JWT (JSON Web Tokens) |
| **AI Service** | Custom microservice (see below) |

---


## 🤖 AI Service

The AI classification and reasoning engine is hosted as a separate microservice.

**AI Service Repository:** `https://github.com/divyanshkande/fixit-aiservice`

This service handles:
- Natural language complaint classification (Electrical, Plumbing, Network, Housekeeping, Other)
- Priority determination (High / Medium / Low)
- Department routing logic
- Transparent reasoning generation
- Safety risk scoring
- Pattern detection and preventive suggestions

To integrate, set the `AI_SERVICE_URL` in your `.env` file to point to the running AI service instance.

---

## 🎬 Demo Flow

Here's the exact 4-minute demo story for judges:

**Step 1 — Student Reports an Issue:**
> Student types: *"Water cooler leaking on 2nd floor CS building"* + attaches a photo.
> AI instantly classifies it, assigns HIGH priority with explanation, routes to Plumbing department, and estimates 4-hour resolution.

**Step 2 — Admin Dashboard:**
> Admin sees the new complaint with full AI recommendation panel.
> Admin assigns a technician. Status updates in real-time for both admin and student.

**Step 3 — Predictive Insights:**
> Dashboard AI insight panel shows: *"Plumbing complaints rising 40% in Block B this month → schedule preventive maintenance this week."*

**Step 4 — Student Feedback:**
> Complaint resolved. Student gives 5 stars.
> AI logs the positive resolution and adjusts future scoring for similar complaints.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add: your feature description'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.