import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL || "http://localhost:5000",
});

// Auto-attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("fixitai_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth APIs
export const authAPI = {
  login: (data) => API.post("/api/auth/login", data),
  register: (data) => API.post("/api/auth/register", data),
  getMe: () => API.get("/api/auth/me"),
};

// Complaint APIs
export const complaintAPI = {
  create: (formData) =>
    API.post("/api/complaints", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getMyComplaints: (params) => API.get("/api/complaints/my", { params }),
  getById: (id) => API.get(`/api/complaints/${id}`),
  getUserComplaints: (userId, params) =>
    API.get(`/api/complaints/user/${userId}`, { params }),

  // Admin
  getAllComplaints: (params) => API.get("/api/complaints", { params }),
  updateStatus: (id, status) =>
    API.patch(`/api/complaints/${id}/status`, { status }),
  assignTechnician: (id, assignedTo) =>
    API.patch(`/api/complaints/${id}/assign`, { assignedTo }),
  getAnalytics: () => API.get("/api/complaints/admin/analytics"),
};

// Feedback APIs
export const feedbackAPI = {
  submit: (data) => API.post("/api/feedback", data),
  getAll: () => API.get("/api/feedback"),
  getByComplaint: (id) => API.get(`/api/feedback/complaint/${id}`),
};

export default API;
