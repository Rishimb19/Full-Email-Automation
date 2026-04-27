// src/app/settings/page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Mail,
  CheckCircle,
  XCircle,
  ExternalLink,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import Navbar from "@/components/Navbar";

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [gmailStatus, setGmailStatus] = useState({
    connected: false,
    email: "",
  });
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    checkGmailStatus();
  }, [user, loading]);

  const checkGmailStatus = async () => {
    try {
      const token = localStorage.getItem("mf_token");
      const res = await api.get("/gmail/status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGmailStatus(res.data.data);
    } catch (error) {
      console.error("Failed to check Gmail status:", error);
    } finally {
      setLoadingStatus(false);
    }
  };

  const connectGmail = async () => {
    setConnecting(true);
    try {
      const token = localStorage.getItem("mf_token");
      const res = await api.get("/gmail/auth-url", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const authUrl = res.data.data.url;

      // Open popup for Gmail authorization
      const popup = window.open(authUrl, "gmail-auth", "width=500,height=600");

      // Listen for callback
      window.addEventListener("message", async (event) => {
        if (event.data?.type === "gmail_connected") {
          await checkGmailStatus();
          toast.success("Gmail connected successfully!");
          setConnecting(false);
        }
      });
    } catch (error) {
      console.error("Connect error:", error);
      toast.error("Failed to connect Gmail");
      setConnecting(false);
    }
  };

  const disconnectGmail = async () => {
    try {
      const token = localStorage.getItem("mf_token");
      await api.post(
        "/gmail/disconnect",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setGmailStatus({ connected: false, email: "" });
      toast.success("Gmail disconnected");
    } catch (error) {
      toast.error("Failed to disconnect");
    }
  };

  if (loading || loadingStatus) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
        <Navbar />
        <div
          style={{
            textAlign: "center",
            padding: "80px",
            color: "var(--text-3)",
          }}
        >
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />

      <div
        className="content-container"
        style={{ paddingTop: 48, paddingBottom: 80 }}
      >
        <div className="section-header">
          <span className="eyebrow">Settings</span>
          <h1>Email Integration</h1>
          <p>Connect your Gmail account to send campaigns</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: gmailStatus.connected
                  ? "rgba(52,211,153,0.12)"
                  : "var(--surface-2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Mail
                size={24}
                color={gmailStatus.connected ? "var(--green)" : "var(--text-3)"}
              />
            </div>
            <div>
              <h3 style={{ marginBottom: 4 }}>Gmail Integration</h3>
              <p style={{ fontSize: 13, color: "var(--text-2)" }}>
                {gmailStatus.connected
                  ? `Connected to ${gmailStatus.email}`
                  : "No Gmail account connected"}
              </p>
            </div>
          </div>

          {gmailStatus.connected ? (
            <button
              onClick={disconnectGmail}
              className="btn btn-danger"
              style={{ width: "100%", justifyContent: "center" }}
            >
              <XCircle size={16} /> Disconnect Gmail
            </button>
          ) : (
            <button
              onClick={connectGmail}
              disabled={connecting}
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
            >
              {connecting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Connecting...
                </>
              ) : (
                <>
                  <ExternalLink size={16} /> Connect Gmail Account
                </>
              )}
            </button>
          )}

          <div
            style={{
              marginTop: 24,
              padding: 16,
              background: "var(--surface-2)",
              borderRadius: 8,
            }}
          >
            <p style={{ fontSize: 12, color: "var(--text-3)" }}>
              <strong>Note:</strong> You need to connect your Gmail account to
              send emails. You'll be redirected to Google to authorize access.
              We only request permission to send emails on your behalf.
            </p>
          </div>
        </div>

        <div style={{ marginTop: 32 }}>
          <button
            onClick={() => router.push("/dashboard")}
            className="btn btn-secondary"
            style={{ width: "100%", justifyContent: "center" }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
