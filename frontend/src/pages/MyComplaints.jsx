import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { complaintAPI, feedbackAPI } from "../utils/api";
import { PriorityBadge, StatusBadge, RiskScore, CategoryIcon } from "../components/Badges";
import { AISection, AIField } from "../components/AIBadge";

const FeedbackModal = ({ complaint, onClose, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit(complaint._id, rating, comment);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999
    }}>
      <div className="card" style={{ width: "440px", maxWidth: "90vw" }}>
        <h3 style={{ marginBottom: "16px" }}>⭐ Submit Feedback</h3>
        <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "16px" }}>
          Rate your experience with the resolution of: <br />
          <em>"{complaint.description.slice(0, 80)}..."</em>
        </p>
        <div className="form-group">
          <label className="form-label">Rating</label>
          <div style={{ display: "flex", gap: "8px" }}>
            {[1,2,3,4,5].map(r => (
              <button key={r} onClick={() => setRating(r)}
                style={{
                  width: "40px", height: "40px", borderRadius: "8px",
                  border: "2px solid", cursor: "pointer", fontSize: "1.1rem",
                  borderColor: rating >= r ? "#f59e0b" : "#e2e8f0",
                  background: rating >= r ? "#fef3c7" : "white"
                }}>
                ⭐
              </button>
            ))}
            <span style={{ lineHeight: "40px", marginLeft: "8px", fontWeight: 700 }}>{rating}/5</span>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Comment (Optional)</label>
          <textarea className="form-control" rows={3} placeholder="How was the resolution..."
            value={comment} onChange={e => setComment(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading} style={{ flex: 1 }}>
            {loading ? "Submitting..." : "Submit Feedback"}
          </button>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

const ComplaintDetail = ({ complaint, onClose }) => {
  const [showReasoning, setShowReasoning] = useState(false);
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 999, padding: "20px"
    }}>
      <div className="card" style={{ width: "600px", maxWidth: "95vw", maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3>Complaint #{complaint._id?.slice(-6).toUpperCase()}</h3>
          <button className="btn btn-secondary" style={{ padding: "6px 12px" }} onClick={onClose}>✕ Close</button>
        </div>

        <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "14px", marginBottom: "16px" }}>
          <p style={{ color: "#64748b", fontSize: "0.8rem", marginBottom: "6px" }}>DESCRIPTION</p>
          <p>{complaint.description}</p>
          {complaint.imageUrl && (
            <img src={complaint.imageUrl} alt="" style={{ width: "100%", maxHeight: "200px", objectFit: "cover", borderRadius: "8px", marginTop: "10px" }} />
          )}
          {complaint.location && <p style={{ marginTop: "8px", fontSize: "0.875rem", color: "#64748b" }}>📍 {complaint.location} {complaint.block && `• ${complaint.block}`}</p>}
        </div>

        <AISection title="AI Analysis">
          <AIField label="Category"><CategoryIcon category={complaint.category} /></AIField>
          <AIField label="Priority"><PriorityBadge priority={complaint.priority} /></AIField>
          <AIField label="Department">{complaint.department}</AIField>
          <AIField label="Est. Resolution">🕐 {complaint.estimatedResolution}</AIField>
        </AISection>

        <div style={{ marginTop: "16px" }}>
          <RiskScore score={complaint.riskScore} />
        </div>

        <button className="btn btn-secondary" style={{ marginTop: "12px", fontSize: "0.8rem" }}
          onClick={() => setShowReasoning(!showReasoning)}>
          🤖 {showReasoning ? "Hide" : "View"} AI Reasoning
        </button>

        {showReasoning && (
          <div style={{ marginTop: "10px", padding: "14px", background: "#faf5ff", border: "1px solid #ddd6fe", borderRadius: "10px", fontSize: "0.875rem", color: "#4c1d95" }}>
            <span style={{ display: "block", fontSize: "0.7rem", fontWeight: 700, color: "#7c3aed", marginBottom: "6px" }}>
              🤖 AI-GENERATED REASONING
            </span>
            {complaint.reasoning}
          </div>
        )}

        <div style={{ marginTop: "16px", padding: "12px", background: "#f0fdf4", borderRadius: "10px" }}>
          <p style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "6px" }}>STATUS</p>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <StatusBadge status={complaint.status} />
            {complaint.assignedTo && <span style={{ fontSize: "0.875rem", color: "#374151" }}>👷 {complaint.assignedTo}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [feedbackTarget, setFeedbackTarget] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [filters, setFilters] = useState({ status: "", priority: "", category: "" });
  const navigate = useNavigate();

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.category) params.category = filters.category;
      const { data } = await complaintAPI.getMyComplaints(params);
      setComplaints(data.complaints);
    } catch (err) {
      setError("Failed to load complaints.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, [filters]);

  const handleFeedback = async (complaintId, rating, comment) => {
    await feedbackAPI.submit({ complaintId, rating, comment });
    setSuccessMsg("✅ Feedback submitted! Thank you.");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const stats = {
    total: complaints.length,
    open: complaints.filter(c => c.status === "Open").length,
    resolved: complaints.filter(c => ["Resolved","Closed"].includes(c.status)).length,
    high: complaints.filter(c => ["High","Critical"].includes(c.priority)).length,
  };

  return (
    <div className="page-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 className="page-title">📋 My Complaints</h1>
          <p className="page-subtitle">Track and manage your submitted complaints</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/submit")}>+ New Complaint</button>
      </div>

      {successMsg && <div className="success-msg">{successMsg}</div>}
      {error && <div className="error-msg">{error}</div>}

      <div className="stat-grid">
        {[
          { label: "Total", value: stats.total, icon: "📋", color: "#dbeafe", iconColor: "#3b82f6" },
          { label: "Open", value: stats.open, icon: "🔵", color: "#dbeafe", iconColor: "#1d4ed8" },
          { label: "Resolved", value: stats.resolved, icon: "✅", color: "#dcfce7", iconColor: "#16a34a" },
          { label: "High Priority", value: stats.high, icon: "🔴", color: "#fee2e2", iconColor: "#dc2626" },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={{ background: s.color, color: s.iconColor }}>{s.icon}</div>
            <div className="stat-info">
              <h3>{s.value}</h3>
              <p>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="filter-bar">
        <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
          <option value="">All Status</option>
          {["Open","Assigned","In Progress","Resolved","Closed"].map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={filters.priority} onChange={e => setFilters({...filters, priority: e.target.value})}>
          <option value="">All Priority</option>
          {["Critical","High","Medium","Low"].map(p => <option key={p}>{p}</option>)}
        </select>
        <select value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})}>
          <option value="">All Category</option>
          {["Plumbing","Electrical","Civil","Housekeeping","IT Infrastructure","Furniture","Others"].map(c => <option key={c}>{c}</option>)}
        </select>
        <button className="btn btn-secondary" style={{ padding: "8px 12px", fontSize: "0.8rem" }}
          onClick={() => setFilters({ status:"", priority:"", category:"" })}>Clear</button>
      </div>

      {loading ? (
        <div className="loading-overlay"><div className="spinner" /><p className="loading-text">Loading complaints...</p></div>
      ) : complaints.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">📭</div>
          <p style={{ fontWeight: 600, marginBottom: "8px" }}>No complaints found</p>
          <p style={{ fontSize: "0.875rem", color: "#94a3b8", marginBottom: "16px" }}>Submit your first complaint and let AI analyze it</p>
          <button className="btn btn-primary" onClick={() => navigate("/submit")}>📝 Submit Complaint</button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>🤖 Category <span style={{ color: "#8b5cf6" }}>(AI)</span></th>
                  <th>🤖 Priority <span style={{ color: "#8b5cf6" }}>(AI)</span></th>
                  <th>🤖 Risk <span style={{ color: "#8b5cf6" }}>(AI)</span></th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map(c => (
                  <tr key={c._id}>
                    <td style={{ maxWidth: "200px" }}>
                      <p style={{ fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {c.description.slice(0, 50)}{c.description.length > 50 ? "..." : ""}
                      </p>
                      {c.location && <p style={{ fontSize: "0.75rem", color: "#94a3b8" }}>📍 {c.location}</p>}
                    </td>
                    {/* 🤖 AI Generated */}
                    <td><CategoryIcon category={c.category} /></td>
                    {/* 🤖 AI Generated */}
                    <td><PriorityBadge priority={c.priority} /></td>
                    {/* 🤖 AI Generated */}
                    <td>
                      <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>{c.riskScore}</span>
                      <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>/100</span>
                    </td>
                    <td><StatusBadge status={c.status} /></td>
                    <td style={{ fontSize: "0.8rem", color: "#64748b" }}>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        <button className="btn btn-secondary" style={{ padding: "4px 10px", fontSize: "0.75rem" }}
                          onClick={() => setSelected(c)}>View</button>
                        {["Resolved","Closed"].includes(c.status) && (
                          <button className="btn btn-success" style={{ padding: "4px 10px", fontSize: "0.75rem" }}
                            onClick={() => setFeedbackTarget(c)}>Rate</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && <ComplaintDetail complaint={selected} onClose={() => setSelected(null)} />}
      {feedbackTarget && (
        <FeedbackModal complaint={feedbackTarget} onClose={() => setFeedbackTarget(null)} onSubmit={handleFeedback} />
      )}
    </div>
  );
};

export default MyComplaints;
