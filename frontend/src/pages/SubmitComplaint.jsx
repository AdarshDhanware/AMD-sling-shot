import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { complaintAPI } from "../utils/api";
import { AISection, AIField } from "../components/AIBadge";
import { PriorityBadge, RiskScore, CategoryIcon } from "../components/Badges";

const SubmitComplaint = () => {
  const [form, setForm] = useState({
    description: "",
    location: "",
    block: "",
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showReasoning, setShowReasoning] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.description.length < 10) {
      return setError("Please describe the issue in at least 10 characters.");
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("description", form.description);
      formData.append("location", form.location);
      formData.append("block", form.block);
      if (image) formData.append("image", image);

      const { data } = await complaintAPI.create(formData);
      setResult(data.complaint);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit complaint.");
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (p) =>
    ({ Critical: "#9d174d", High: "#991b1b", Medium: "#92400e", Low: "#166534" }[p] || "#92400e");

  if (loading) {
    return (
      <div className="page-container">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
            gap: "20px",
          }}
        >
          <div className="ai-spinner" />
          <div style={{ textAlign: "center" }}>
            <p
              style={{
                fontSize: "1.2rem",
                fontWeight: 700,
                color: "#6d28d9",
                marginBottom: "8px",
              }}
            >
              🤖 Analyzing with AI...
            </p>
            <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
              Our AI is processing your complaint — categorizing, prioritizing,
              and calculating risk score.
            </p>
          </div>
          <div
            style={{
              background: "#f0f4ff",
              border: "1px solid #c4b5fd",
              borderRadius: "12px",
              padding: "16px 24px",
              fontSize: "0.85rem",
              color: "#7c3aed",
              textAlign: "center",
            }}
          >
            ⚙️ Detecting category → 🎯 Calculating priority → 📊 Generating risk score
          </div>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="page-container">
        <div className="success-msg">
          ✅ Complaint submitted successfully! AI has analyzed your complaint.
        </div>

        <div className="card" style={{ marginBottom: "20px" }}>
          <div className="card-header">
            <h2 className="card-title">📋 Complaint Submitted</h2>
            <p style={{ color: "#64748b", fontSize: "0.875rem", marginTop: "4px" }}>
              ID: #{result._id?.slice(-6).toUpperCase()}
            </p>
          </div>

          <div
            style={{
              padding: "14px",
              background: "#f8fafc",
              borderRadius: "10px",
              marginBottom: "20px",
            }}
          >
            <p style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "6px" }}>
              YOUR DESCRIPTION
            </p>
            <p style={{ color: "#1e293b" }}>{result.description}</p>
            {result.imageUrl && (
              <img
                src={result.imageUrl}
                alt="Uploaded"
                style={{
                  width: "100%",
                  maxHeight: "200px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  marginTop: "10px",
                }}
              />
            )}
          </div>

          {/* AI ANALYSIS SECTION - All fields below are AI-generated */}
          <AISection title="AI Analysis Results">
            <AIField label="Category">
              <CategoryIcon category={result.category} />
            </AIField>
            <AIField label="Priority">
              <PriorityBadge priority={result.priority} />
            </AIField>
            <AIField label="Routed To Department">
              {result.department}
            </AIField>
            <AIField label="Est. Resolution">
              🕐 {result.estimatedResolution}
            </AIField>
          </AISection>

          {/* Risk Score - AI Generated */}
          <div style={{ marginTop: "20px" }}>
            <RiskScore score={result.riskScore} />
          </div>

          {/* AI Reasoning - Expandable */}
          <div style={{ marginTop: "16px" }}>
            <button
              className="btn btn-secondary"
              style={{ fontSize: "0.8rem", padding: "8px 14px" }}
              onClick={() => setShowReasoning(!showReasoning)}
            >
              🤖 {showReasoning ? "Hide" : "View"} AI Reasoning
            </button>

            {showReasoning && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "14px",
                  background: "#faf5ff",
                  border: "1px solid #ddd6fe",
                  borderRadius: "10px",
                  fontSize: "0.875rem",
                  color: "#4c1d95",
                  lineHeight: 1.7,
                }}
              >
                {/* 🤖 AI Generated: This text is AI output reasoning */}
                <span
                  style={{
                    display: "block",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: "#7c3aed",
                    marginBottom: "8px",
                    letterSpacing: "0.5px",
                  }}
                >
                  🤖 AI-GENERATED REASONING
                </span>
                {result.reasoning}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/my-complaints")}
          >
            📋 View All Complaints
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setResult(null);
              setForm({ description: "", location: "", block: "" });
              setImage(null);
              setImagePreview(null);
            }}
          >
            ➕ Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">📝 Submit a Complaint</h1>
      <p className="page-subtitle">
        Describe your issue. Our AI will automatically categorize, prioritize, and route it.
      </p>

      {error && <div className="error-msg">⚠️ {error}</div>}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Describe the Problem *</label>
            <textarea
              className="form-control"
              placeholder="Describe the issue in detail (e.g., Water is leaking from the bathroom pipe on 2nd floor of hostel Block B, causing flooding...)"
              style={{ minHeight: "120px" }}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
            <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "4px" }}>
              {form.description.length} characters (minimum 10)
            </p>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                className="form-control"
                placeholder="e.g., Room 204, 2nd Floor"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Block / Building</label>
              <select
                className="form-control"
                value={form.block}
                onChange={(e) => setForm({ ...form, block: e.target.value })}
              >
                <option value="">Select Block</option>
                {["Block A", "Block B", "Block C", "Block D", "Main Block", "Hostel", "Library", "Canteen"].map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Upload Image (Optional)</label>
            <input
              type="file"
              accept="image/*"
              className="form-control"
              onChange={handleImageChange}
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  width: "100%",
                  maxHeight: "200px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  marginTop: "10px",
                }}
              />
            )}
          </div>

          <div
            style={{
              padding: "12px 16px",
              background: "#f0f4ff",
              borderRadius: "10px",
              marginBottom: "20px",
              fontSize: "0.8rem",
              color: "#4338ca",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            🤖 <span>After submission, <strong>AI will automatically</strong> detect category, assign priority, calculate risk score, and route to the right department.</span>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", padding: "14px" }}
          >
            🚀 Submit & Analyze with AI
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitComplaint;
