import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SubmitComplaint from "./pages/SubmitComplaint";
import MyComplaints from "./pages/MyComplaints";
import AdminDashboard from "./pages/AdminDashboard";
import AdminComplaints from "./pages/AdminComplaints";
import AdminAnalytics from "./pages/AdminAnalytics";
import "./index.css";

// Protected route wrapper
const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-overlay" style={{ minHeight: "100vh" }}>
        <div className="spinner" />
        <p className="loading-text">Loading...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/my-complaints"} replace />;
  }
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/login" element={user ? <Navigate to={user.role === "admin" ? "/admin" : "/my-complaints"} /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to={user.role === "admin" ? "/admin" : "/my-complaints"} /> : <Register />} />

        {/* Student Routes */}
        <Route path="/submit" element={
          <ProtectedRoute role="student"><SubmitComplaint /></ProtectedRoute>
        } />
        <Route path="/my-complaints" element={
          <ProtectedRoute role="student"><MyComplaints /></ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/admin/complaints" element={
          <ProtectedRoute role="admin"><AdminComplaints /></ProtectedRoute>
        } />
        <Route path="/admin/analytics" element={
          <ProtectedRoute role="admin"><AdminAnalytics /></ProtectedRoute>
        } />

        {/* Default redirect */}
        <Route path="/" element={
          user
            ? <Navigate to={user.role === "admin" ? "/admin" : "/my-complaints"} />
            : <Navigate to="/login" />
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
