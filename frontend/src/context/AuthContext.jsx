import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set axios base URL
  axios.defaults.baseURL =
    import.meta.env.VITE_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    // Load user from localStorage on app start
    const token = localStorage.getItem("fixitai_token");
    const savedUser = localStorage.getItem("fixitai_user");
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await axios.post("/api/auth/login", { email, password });
    localStorage.setItem("fixitai_token", data.token);
    localStorage.setItem("fixitai_user", JSON.stringify(data));
    axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    setUser(data);
    return data;
  };

  const register = async (userData) => {
    const { data } = await axios.post("/api/auth/register", userData);
    localStorage.setItem("fixitai_token", data.token);
    localStorage.setItem("fixitai_user", JSON.stringify(data));
    axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("fixitai_token");
    localStorage.removeItem("fixitai_user");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
