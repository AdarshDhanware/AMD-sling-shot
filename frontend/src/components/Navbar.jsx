import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path ? "active" : "";

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        🔧 FixItAI
        <span className="ai-badge">AI</span>
      </div>

      <ul className="navbar-nav">
        {user.role === "student" && (
          <>
            <li>
              <Link to="/submit" className={isActive("/submit")}>
                📝 Submit
              </Link>
            </li>
            <li>
              <Link to="/my-complaints" className={isActive("/my-complaints")}>
                📋 My Complaints
              </Link>
            </li>
          </>
        )}

        {user.role === "admin" && (
          <>
            <li>
              <Link to="/admin" className={isActive("/admin")}>
                📊 Dashboard
              </Link>
            </li>
            <li>
              <Link to="/admin/complaints" className={isActive("/admin/complaints")}>
                🗂️ Complaints
              </Link>
            </li>
            <li>
              <Link to="/admin/analytics" className={isActive("/admin/analytics")}>
                📈 Analytics
              </Link>
            </li>
          </>
        )}

        <li style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "8px" }}>
          <span style={{ fontSize: "0.8rem", opacity: 0.8 }}>
            👤 {user.name}
          </span>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
