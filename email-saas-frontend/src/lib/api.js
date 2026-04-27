// src/lib/api.js
import axios from "axios";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

const api = axios.create({ baseURL: BASE, timeout: 60000 });

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("mf_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMessage = "Something went wrong";

    if (error.response?.data?.error?.message) {
      errorMessage = error.response.data.error.message;
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    if (typeof window !== "undefined") {
      console.error("API Error:", errorMessage);
    }

    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("mf_token");
      localStorage.removeItem("mf_user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

// Auth API
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  googleSignIn: (data) => api.post("/auth/google", data),
  updateProfile: (data) => api.put("/auth/profile", data),
  changePassword: (data) => api.put("/auth/change-password", data),
};

// Templates API
export const templatesAPI = {
  list: () => api.get("/templates"),
  get: (id) => api.get(`/templates/${id}`),
  create: (data) => api.post("/templates", data),
  update: (id, data) => api.put(`/templates/${id}`, data),
  delete: (id) => api.delete(`/templates/${id}`),
};

// Campaigns API
export const campaignsAPI = {
  list: () => api.get("/campaigns"),
  get: (id) => api.get(`/campaigns/${id}`),
  create: (data) => api.post("/campaigns", data),
  update: (id, data) => api.put(`/campaigns/${id}`, data),
  delete: (id) => api.delete(`/campaigns/${id}`),
  status: (id) => api.get(`/campaigns/${id}/status`),
};

// Generate API
export const generateAPI = {
  suggestFields: (subject) => api.post("/generate/suggest-fields", { subject }),
  emailBody: (data) => api.post("/generate/email-body", data),
  regenerate: (data) => api.post("/generate/regenerate", data),
};

// Recipients API
export const recipientsAPI = {
  parseFile: (formData) =>
    api.post("/recipients/parse-file", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  validateFields: (data) => api.post("/recipients/validate-fields", data),
};

// Validate API
export const validateAPI = {
  emails: (emails) => api.post("/validate/emails", { emails }),
  single: (email) => api.post("/validate/single", { email }),
};

// Send API
export const sendAPI = {
  preview: (data) => api.post("/send/preview", data),
  send: (id) => api.post(`/send/campaign/${id}`),
  results: (id) => api.get(`/send/campaign/${id}/results`),
};

export default api;
