import React, { useState, useEffect } from "react";
import { complaintAPI } from "../utils/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316"];
const PRIORITY_COLORS = { Critical: "#9d174d", High: "#dc2626", Medium: "#d97706", Low: "#16a34a" };

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await complaintAPI.getAnalytics();
        setAnalytics(data);
      } catch (err) {
        setError("Failed to load analytics data.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-overlay">
          <div className="spinner" />
          <p className="loading-text">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="page-container"><div className="error-msg">{error}</div></div>;
  }

  const { summary, byCategory, byPriority, byStatus, recentByBlock } = analytics;

  const priorityChartData = byPriority.map(p => ({
    name: p._id,
    value: p.count,
    fill: PRIORITY_COLORS[p._id] || "#64748b"
  }));

  const statusChartData = byStatus.map(s => ({ name: s._id, value: s.count }));

  // AI Insights panel
  const topCategory = byCategory[0]?._id || summary.mostFrequentCategory;
  const topBlock = recentByBlock[0]?._id || "N/A";
  const topBlockCount = recentByBlock[0]?.count || 0;

  return (
    <div className="page-container">
      <h1 className="page-title">📊 Admin Dashboard</h1>
      <p className="page-subtitle">Overview of all complaints and AI-generated insights</p>

      {/* Summary Cards */}
      <div className="stat-grid">
        {[
          { label: "Total Complaints", value: summary.totalComplaints, icon: "📋", bg: "#dbeafe", ic: "#1d4ed8" },
          { label: "Open Complaints", value: summary.openComplaints, icon: "🔵", bg: "#fef3c7", ic: "#d97706" },
          { label: "Resolved", value: summary.resolvedComplaints, icon: "✅", bg: "#dcfce7", ic: "#16a34a" },
          { label: "High Priority Open", value: summary.highPriorityCount, icon: "🔴", bg: "#fee2e2", ic: "#dc2626" },
          { label: "Avg. Resolution", value: `${summary.avgResolutionHours}h`, icon: "⏱️", bg: "#f0f4ff", ic: "#4338ca" },
          { label: "Top Category", value: summary.mostFrequentCategory, icon: "🏆", bg: "#fdf4ff", ic: "#7c3aed", small: true },
        ].map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={{ background: s.bg, color: s.ic }}>{s.icon}</div>
            <div className="stat-info">
              <h3 style={{ fontSize: s.small ? "1rem" : undefined }}>{s.value}</h3>
              <p>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid-2" style={{ marginBottom: "20px" }}>
        {/* Category Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              📦 Complaints by Category
              <span style={{ fontSize: "0.7rem", color: "#94a3b8", marginLeft: "8px" }}>
                (🤖 AI-classified)
              </span>
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={byCategory.map(c => ({ name: c._id, count: c.count }))}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              🎯 Priority Distribution
              <span style={{ fontSize: "0.7rem", color: "#94a3b8", marginLeft: "8px" }}>
                (🤖 AI-scored)
              </span>
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={priorityChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}`}>
                {priorityChartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid-2">
        {/* Status Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📊 Status Overview</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={statusChartData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 🤖 AI Insight Panel */}
        <div className="card" style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #faf5ff 100%)", border: "1px solid #c4b5fd" }}>
          <div className="card-header">
            <h3 className="card-title" style={{ color: "#6d28d9" }}>
              🤖 AI Insights Panel
              <span style={{ fontSize: "0.7rem", background: "#ede9fe", color: "#7c3aed", padding: "2px 6px", borderRadius: "4px", marginLeft: "8px" }}>
                AI GENERATED
              </span>
            </h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              {
                icon: "📊",
                // 🤖 AI Generated: Most frequent complaint category
                text: `Most frequent complaint: ${summary.mostFrequentCategory}`,
              },
              {
                icon: "🏢",
                // 🤖 AI Generated: Block with most complaints
                text: `${topBlock} has ${topBlockCount} issues this week`,
              },
              {
                icon: "🔴",
                // 🤖 AI Generated: High priority count
                text: `${summary.highPriorityCount} high-priority complaints need immediate attention`,
              },
              {
                icon: "⏱️",
                // 🤖 AI Generated: Estimated resolution time
                text: `Average resolution time: ${summary.avgResolutionHours} hours`,
              },
              {
                icon: "💡",
                // 🤖 AI Generated: Preventive maintenance suggestion
                text: `AI suggests preventive maintenance for ${summary.mostFrequentCategory} issues`,
              },
            ].map((insight, i) => (
              <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "10px", background: "white", borderRadius: "10px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <span style={{ fontSize: "1.1rem" }}>{insight.icon}</span>
                <span style={{ fontSize: "0.875rem", color: "#4c1d95", fontWeight: 500 }}>{insight.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Block Hotspots */}
      {recentByBlock.length > 0 && (
        <div className="card" style={{ marginTop: "20px" }}>
          <div className="card-header">
            <h3 className="card-title">🏢 Issue Hotspots by Block</h3>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {recentByBlock.map((b, i) => (
              <div key={i} style={{
                padding: "14px 20px",
                background: `hsl(${220 + i * 30}, 70%, ${95 - i * 3}%)`,
                borderRadius: "12px",
                textAlign: "center",
                minWidth: "100px"
              }}>
                <p style={{ fontWeight: 800, fontSize: "1.5rem", color: "#1e293b" }}>{b.count}</p>
                <p style={{ fontSize: "0.8rem", color: "#475569" }}>{b._id}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
