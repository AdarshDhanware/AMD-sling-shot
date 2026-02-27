import React, { useState, useEffect } from "react";
import { complaintAPI } from "../utils/api";
import { PriorityBadge, StatusBadge, RiskScore, CategoryIcon } from "../components/Badges";
import { AISection, AIField } from "../components/AIBadge";

const TECHNICIANS = [
  "Rajesh Kumar (Electrician)",
  "Suresh Plumber",
  "Mahesh (Civil)",
  "IT Support Team",
  "Housekeeping Team",
  "Furniture Team",
  "General Maintenance",
];

const DetailModal = ({ complaint, onClose, onUpdate }) => {
  const [status, setStatus] = useState(complaint.status);
  const [assignedTo, setAssignedTo] = useState(complaint.assignedTo || "");
  const [customTech, setCustomTech] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);

  const handleUpdateStatus = async () => {
    setLoading(true);
    try {
      await complaintAPI.updateStatus(complaint._id, status);
      onUpdate();
      onClose();
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    const tech = customTech || assignedTo;
    if (!tech) return alert("Please select or enter a technician name");
    setLoading(true);
    try {
      await complaintAPI.assignTechnician(complaint._id, tech);
      onUpdate();
      onClose();
    } catch (err) {
      alert("Failed to assign technician");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: "20px" }}>
      <div className="card" style={{ width: "640px", maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3>🗂️ Complaint #{complaint._id?.slice(-6).toUpperCase()}</h3>
          <button className="btn btn-secondary" style={{ padding: "6px 12px" }} onClick={onClose}>✕</button>
        </div>

        {/* Student Info */}
        {complaint.userId && (
          <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "10px", marginBottom: "16px", fontSize: "0.875rem" }}>
            <span>👤 <strong>{complaint.userId.name}</strong></span>
            <span style={{ color: "#64748b", marginLeft: "12px" }}>{complaint.userId.email}</span>
            {complaint.userId.rollNumber && <span style={{ color: "#64748b", marginLeft: "12px" }}>#{complaint.userId.rollNumber}</span>}
          </div>
        )}

        {/* Description */}
        <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "14px", marginBottom: "16px" }}>
          <p style={{ color: "#64748b", fontSize: "0.8rem", marginBottom: "6px" }}>COMPLAINT DESCRIPTION</p>
          <p style={{ lineHeight: 1.7 }}>{complaint.description}</p>
          {complaint.imageUrl && (
            <img src={complaint.imageUrl} alt="" style={{ width: "100%", maxHeight: "200px", objectFit: "cover", borderRadius: "8px", marginTop: "10px" }} />
          )}
          {(complaint.location || complaint.block) && (
            <p style={{ marginTop: "8px", fontSize: "0.875rem", color: "#64748b" }}>
              📍 {complaint.location} {complaint.block && `• ${complaint.block}`}
            </p>
          )}
        </div>

        {/* AI Analysis - ALL FIELDS BELOW ARE AI GENERATED */}
        <AISection title="AI Analysis Results">
          <AIField label="Category"><CategoryIcon category={complaint.category} /></AIField>
          <AIField label="Priority"><PriorityBadge priority={complaint.priority} /></AIField>
          <AIField label="Dept. Routed To">{complaint.department}</AIField>
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
          <div style={{ marginTop: "10px", padding: "14px", background: "#faf5ff", border: "1px solid #ddd6fe", borderRadius: "10px", fontSize: "0.875rem", color: "#4c1d95", lineHeight: 1.7 }}>
            {/* 🤖 AI Generated: Reasoning text is AI output */}
            <span style={{ display: "block", fontSize: "0.7rem", fontWeight: 700, color: "#7c3aed", marginBottom: "6px" }}>🤖 AI-GENERATED REASONING</span>
            {complaint.reasoning}
          </div>
        )}

        {/* Admin Actions */}
        <div style={{ marginTop: "20px", padding: "16px", background: "#f0fdf4", borderRadius: "12px", border: "1px solid #bbf7d0" }}>
          <h4 style={{ marginBottom: "14px", color: "#166534" }}>⚙️ Admin Actions</h4>
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-end", flexWrap: "wrap", marginBottom: "14px" }}>
            <div style={{ flex: 1, minWidth: "180px" }}>
              <label className="form-label" style={{ fontSize: "0.8rem" }}>Update Status</label>
              <select className="form-control" value={status} onChange={e => setStatus(e.target.value)}>
                {["Open", "Assigned", "In Progress", "Resolved", "Closed"].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <button className="btn btn-primary" onClick={handleUpdateStatus} disabled={loading} style={{ whiteSpace: "nowrap" }}>
              Update Status
            </button>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "flex-end", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "180px" }}>
              <label className="form-label" style={{ fontSize: "0.8rem" }}>Assign Technician</label>
              <select className="form-control" value={assignedTo} onChange={e => { setAssignedTo(e.target.value); setCustomTech(""); }}>
                <option value="">Select technician...</option>
                {TECHNICIANS.map(t => <option key={t} value={t}>{t}</option>)}
                <option value="__custom">Enter custom name...</option>
              </select>
              {(assignedTo === "__custom" || customTech) && (
                <input className="form-control" style={{ marginTop: "8px" }}
                  placeholder="Enter technician name"
                  value={customTech}
                  onChange={e => setCustomTech(e.target.value)} />
              )}
            </div>
            <button className="btn btn-success" onClick={handleAssign} disabled={loading}>
              👷 Assign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    status: "", priority: "", category: "", search: ""
  });

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.category) params.category = filters.category;
      if (filters.search) params.search = filters.search;
      const { data } = await complaintAPI.getAllComplaints(params);
      setComplaints(data.complaints);
      setTotal(data.total);
    } catch (err) {
      setError("Failed to load complaints.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, [filters, page]);

  const clearFilters = () => {
    setFilters({ status: "", priority: "", category: "", search: "" });
    setPage(1);
  };

  return (
    <div className="page-container">
      <h1 className="page-title">🗂️ All Complaints</h1>
      <p className="page-subtitle">Manage, assign, and update all student complaints. AI-analyzed fields marked with 🤖</p>

      {error && <div className="error-msg">{error}</div>}

      <div className="filter-bar">
        <input
          placeholder="🔍 Search description..."
          value={filters.search}
          onChange={e => setFilters({...filters, search: e.target.value})}
          style={{ minWidth: "200px" }}
        />
        <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
          <option value="">All Status</option>
          {["Open","Assigned","In Progress","Resolved","Closed"].map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={filters.priority} onChange={e => setFilters({...filters, priority: e.target.value})}>
          <option value="">All Priority (🤖 AI)</option>
          {["Critical","High","Medium","Low"].map(p => <option key={p}>{p}</option>)}
        </select>
        <select value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})}>
          <option value="">All Category (🤖 AI)</option>
          {["Plumbing","Electrical","Civil","Housekeeping","IT Infrastructure","Furniture","Others"].map(c => <option key={c}>{c}</option>)}
        </select>
        <button className="btn btn-secondary" onClick={clearFilters} style={{ padding: "8px 12px", fontSize: "0.8rem" }}>
          Clear
        </button>
        <span style={{ marginLeft: "auto", fontSize: "0.875rem", color: "#64748b", fontWeight: 500 }}>
          {total} total
        </span>
      </div>

      {loading ? (
        <div className="loading-overlay"><div className="spinner" /></div>
      ) : complaints.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">📭</div>
          <p>No complaints match the current filters.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student</th>
                  <th>Description</th>
                  <th>🤖 Category</th>
                  <th>🤖 Priority</th>
                  <th>🤖 Risk</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c, i) => (
                  <tr key={c._id}>
                    <td style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
                      #{c._id?.slice(-4).toUpperCase()}
                    </td>
                    <td style={{ fontSize: "0.8rem" }}>
                      <div style={{ fontWeight: 600 }}>{c.userId?.name || "—"}</div>
                      <div style={{ color: "#94a3b8" }}>{c.userId?.rollNumber || ""}</div>
                    </td>
                    <td style={{ maxWidth: "180px" }}>
                      <p style={{ fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "180px" }}>
                        {c.description.slice(0, 55)}{c.description.length > 55 ? "..." : ""}
                      </p>
                      {c.block && <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{c.block}</span>}
                    </td>
                    {/* 🤖 AI Generated: category */}
                    <td style={{ fontSize: "0.875rem" }}><CategoryIcon category={c.category} /></td>
                    {/* 🤖 AI Generated: priority */}
                    <td><PriorityBadge priority={c.priority} /></td>
                    {/* 🤖 AI Generated: riskScore */}
                    <td>
                      <span style={{ fontWeight: 700 }}>{c.riskScore}</span>
                      <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>/100</span>
                    </td>
                    <td><StatusBadge status={c.status} /></td>
                    <td style={{ fontSize: "0.8rem", color: "#374151" }}>
                      {c.assignedTo || <span style={{ color: "#94a3b8" }}>Unassigned</span>}
                    </td>
                    <td style={{ fontSize: "0.8rem", color: "#64748b", whiteSpace: "nowrap" }}>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button className="btn btn-primary" style={{ padding: "5px 12px", fontSize: "0.75rem" }}
                        onClick={() => setSelected(c)}>
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {total > 15 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "20px" }}>
          <button className="btn btn-secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span style={{ lineHeight: "38px", color: "#64748b", fontSize: "0.875rem" }}>
            Page {page} of {Math.ceil(total / 15)}
          </span>
          <button className="btn btn-secondary" disabled={page >= Math.ceil(total / 15)} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}

      {selected && (
        <DetailModal
          complaint={selected}
          onClose={() => setSelected(null)}
          onUpdate={fetchComplaints}
        />
      )}
    </div>
  );
};

export default AdminComplaints;
