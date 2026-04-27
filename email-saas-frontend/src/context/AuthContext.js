// src/context/AuthContext.js
"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "@/lib/api";
import toast from "react-hot-toast";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("mf_token");
    const savedUser = localStorage.getItem("mf_user");

    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error("Failed to parse user:", error);
        localStorage.removeItem("mf_token");
        localStorage.removeItem("mf_user");
      }
    }
    setLoading(false);
  }, []);

  // Regular email/password login
  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });

      let userData, token;
      if (response.data.data) {
        userData = response.data.data.user;
        token = response.data.data.token;
      } else {
        userData = response.data.user;
        token = response.data.token;
      }

      if (!userData || !token) {
        throw new Error("Invalid response from server");
      }

      localStorage.setItem("mf_token", token);
      localStorage.setItem("mf_user", JSON.stringify(userData));
      setUser(userData);
      toast.success("Welcome back!");
      return userData;
    } catch (error) {
      const message =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message ||
        "Login failed";
      toast.error(message);
      throw error;
    }
  };

  // Regular email/password registration
  const register = async (name, email, password) => {
    try {
      const response = await authAPI.register({ name, email, password });

      let userData, token;
      if (response.data.data) {
        userData = response.data.data.user;
        token = response.data.data.token;
      } else {
        userData = response.data.user;
        token = response.data.token;
      }

      if (!userData || !token) {
        throw new Error("Invalid response from server");
      }

      localStorage.setItem("mf_token", token);
      localStorage.setItem("mf_user", JSON.stringify(userData));
      setUser(userData);
      toast.success("Account created successfully!");
      return userData;
    } catch (error) {
      const message =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message ||
        "Registration failed";
      toast.error(message);
      throw error;
    }
  };

  // Google Sign In
  const googleSignIn = async (credential) => {
    try {
      const response = await authAPI.googleSignIn({ credential });

      let userData, token;
      if (response.data.data) {
        userData = response.data.data.user;
        token = response.data.data.token;
      } else {
        userData = response.data.user;
        token = response.data.token;
      }

      localStorage.setItem("mf_token", token);
      localStorage.setItem("mf_user", JSON.stringify(userData));
      setUser(userData);
      toast.success("Signed in with Google!");
      return userData;
    } catch (error) {
      const message =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Google sign in failed";
      toast.error(message);
      throw error;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("mf_token");
    localStorage.removeItem("mf_user");
    setUser(null);
    toast.success("Logged out successfully");
  };

  return (
    <AuthCtx.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        googleSignIn,
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
