import React from "react";

export const PriorityBadge = ({ priority }) => {
  const map = {
    Critical: { cls: "badge-critical", icon: "🔴" },
    High: { cls: "badge-high", icon: "🟠" },
    Medium: { cls: "badge-medium", icon: "🟡" },
    Low: { cls: "badge-low", icon: "🟢" },
  };
  const { cls, icon } = map[priority] || { cls: "badge-medium", icon: "🟡" };
  return (
    <span className={`badge ${cls}`}>
      {icon} {priority}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const map = {
    Open: "badge-open",
    Assigned: "badge-assigned",
    "In Progress": "badge-inprogress",
    Resolved: "badge-resolved",
    Closed: "badge-closed",
  };
  const cls = map[status] || "badge-open";
  return <span className={`badge ${cls}`}>{status}</span>;
};

export const RiskScore = ({ score }) => {
  const color =
    score >= 80
      ? "#dc2626"
      : score >= 60
      ? "#ea580c"
      : score >= 40
      ? "#ca8a04"
      : "#16a34a";

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "4px",
          fontSize: "0.8rem",
        }}
      >
        <span style={{ color: "#7c3aed", fontWeight: 600, fontSize: "0.7rem" }}>
          🤖 AI Risk Score
        </span>
        <span style={{ fontWeight: 700, color }}>{score}/100</span>
      </div>
      <div className="risk-bar">
        <div
          className="risk-fill"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
    </div>
  );
};

export const CategoryIcon = ({ category }) => {
  const icons = {
    Plumbing: "🔧",
    Electrical: "⚡",
    Civil: "🏗️",
    Housekeeping: "🧹",
    "IT Infrastructure": "💻",
    Furniture: "🪑",
    Others: "📦",
  };
  return <span>{icons[category] || "📦"} {category}</span>;
};
