import React, { useState, useEffect } from "react";
import { complaintAPI, feedbackAPI } from "../utils/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend
} from "recharts";

const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316"];
const PRIORITY_COLORS = { Critical: "#9d174d", High: "#dc2626", Medium: "#d97706", Low: "#16a34a" };

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [feedbackData, setFeedbackData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      complaintAPI.getAnalytics(),
      feedbackAPI.getAll(),
    ]).then(([analyticsRes, feedbackRes]) => {
      setAnalytics(analyticsRes.data);
      setFeedbackData(feedbackRes.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-overlay"><div className="spinner" /></div>
      </div>
    );
  }

  const { summary, byCategory, byPriority, byStatus, recentByBlock } = analytics;

  const priorityData = byPriority.map(p => ({
    name: p._id, value: p.count, fill: PRIORITY_COLORS[p._id] || "#64748b"
  }));

  const resolutionRateData = byStatus.map(s => ({
    name: s._id, value: s.count
  }));

  return (
    <div className="page-container">
      <h1 className="page-title">📈 Analytics & Insights</h1>
      <p className="page-subtitle">
        AI-powered analytics. Fields labeled 🤖 contain AI-generated classifications.
      </p>

      {/* KPI Cards */}
      <div className="stat-grid" style={{ marginBottom: "28px" }}>
        {[
          { label: "Total Complaints", val: summary.totalComplaints, icon: "📋", bg: "#dbeafe" },
          { label: "Resolution Rate", val: `${Math.round((summary.resolvedComplaints / (summary.totalComplaints || 1)) * 100)}%`, icon: "✅", bg: "#dcfce7" },
          { label: "Avg Resolution", val: `${summary.avgResolutionHours}h`, icon: "⏱️", bg: "#f0f4ff" },
          { label: "Feedback Rating", val: feedbackData?.avgRating ? `${feedbackData.avgRating}⭐` : "N/A", icon: "🌟", bg: "#fef3c7" },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
            <div className="stat-info">
              <h3>{s.val}</h3>
              <p>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 🤖 AI Insight Cards */}
      <div className="card" style={{
        background: "linear-gradient(135deg, #f0f4ff 0%, #faf5ff 100%)",
        border: "1px solid #c4b5fd",
        marginBottom: "20px"
      }}>
        <div className="card-header">
          <h3 className="card-title" style={{ color: "#6d28d9" }}>
            🤖 AI-Generated Insights
            <span style={{ fontSize: "0.7rem", background: "#ede9fe", color: "#7c3aed", padding: "2px 8px", borderRadius: "6px", marginLeft: "8px" }}>
              ALL BELOW ARE AI OUTPUT
            </span>
          </h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
          {[
            {
              title: "🏆 Top Category",
              // 🤖 AI Generated: AI-classified complaint category
              value: summary.mostFrequentCategory,
              note: "Most reported issue type (AI classified)"
            },
            {
              title: "🔴 Critical Open",
              // 🤖 AI Generated: AI-scored high priority complaints
              value: `${summary.highPriorityCount} complaints`,
              note: "Flagged high/critical by AI risk scoring"
            },
            {
              title: "💡 Recommendation",
              // 🤖 AI Generated: AI suggestion for preventive maintenance
              value: `Schedule preventive ${summary.mostFrequentCategory} maintenance`,
              note: "AI-generated preventive maintenance suggestion"
            },
            {
              title: "📊 Resolution Efficiency",
              // 🤖 AI Generated: AI estimated resolution tracking
              value: `${summary.avgResolutionHours}h avg`,
              note: "Based on AI-tracked resolution timestamps"
            },
          ].map((item, i) => (
            <div key={i} style={{ background: "white", padding: "14px", borderRadius: "10px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#7c3aed", marginBottom: "6px" }}>{item.title}</p>
              <p style={{ fontWeight: 700, color: "#1e293b", marginBottom: "4px" }}>{item.value}</p>
              <p style={{ fontSize: "0.7rem", color: "#94a3b8" }}>{item.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid-2" style={{ marginBottom: "20px" }}>
        {/* Category Bar Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              🤖 Complaints by Category
              <span style={{ color: "#7c3aed", fontSize: "0.7rem", marginLeft: "6px" }}>(AI-classified)</span>
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byCategory.map(c => ({ name: c._id, Complaints: c.count }))} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="Complaints" radius={[6, 6, 0, 0]}>
                {byCategory.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Pie */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              🤖 Priority Distribution
              <span style={{ color: "#7c3aed", fontSize: "0.7rem", marginLeft: "6px" }}>(AI-scored)</span>
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={priorityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}>
                {priorityData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [value, `${name} Priority`]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: "20px" }}>
        {/* Status Overview */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📊 Status Breakdown</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={resolutionRateData} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" radius={[0, 6, 6, 0]}>
                {resolutionRateData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Block Hotspots */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🏢 Block Hotspots</h3>
          </div>
          {recentByBlock.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={recentByBlock.map(b => ({ name: b._id, Issues: b.count }))} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="Issues" fill="#f97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: "40px" }}>
              <p>No block data available yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Feedback Section */}
      {feedbackData && feedbackData.feedbacks.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              ⭐ Student Feedback
              <span style={{ marginLeft: "12px", color: "#f59e0b", fontWeight: 700 }}>
                Avg: {feedbackData.avgRating}/5
              </span>
            </h3>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {feedbackData.feedbacks.slice(0, 6).map(f => (
              <div key={f._id} style={{
                flex: "1 1 280px",
                padding: "14px",
                background: "#f8fafc",
                borderRadius: "10px",
                border: "1px solid #e2e8f0"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>{f.userId?.name}</span>
                  <span style={{ color: "#f59e0b" }}>{"⭐".repeat(f.rating)}</span>
                </div>
                {f.comment && (
                  <p style={{ fontSize: "0.8rem", color: "#475569", fontStyle: "italic" }}>"{f.comment}"</p>
                )}
                {f.complaintId && (
                  <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "6px" }}>
                    Re: {f.complaintId.description?.slice(0, 50)}...
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;
