import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === "admin" ? "/admin" : "/my-complaints");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === "admin") setForm({ email: "admin@fixitai.com", password: "admin123" });
    else setForm({ email: "student@fixitai.com", password: "student123" });
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>🔧 FixItAI</h1>
          <p>AI-Powered Campus Complaint Management</p>
        </div>

        {error && <div className="error-msg">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="your@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        <div style={{ marginTop: "20px", padding: "16px", background: "#f8fafc", borderRadius: "10px" }}>
          <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "10px", fontWeight: 600 }}>
            🚀 DEMO ACCOUNTS
          </p>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn btn-secondary" style={{ flex: 1, fontSize: "0.8rem" }} onClick={() => fillDemo("admin")}>
              Admin Demo
            </button>
            <button className="btn btn-secondary" style={{ flex: 1, fontSize: "0.8rem" }} onClick={() => fillDemo("student")}>
              Student Demo
            </button>
          </div>
        </div>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "0.875rem", color: "#64748b" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "#3b82f6", fontWeight: 600 }}>
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
