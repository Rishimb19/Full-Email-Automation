// src/app/gmail-callback/page.js
"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function GmailCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Connecting to Gmail...");
  const [error, setError] = useState(null);

  useEffect(() => {
    const code = searchParams.get("code");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setStatus("Authorization failed");
      setError(errorParam);
      toast.error("Failed to connect Gmail");
      setTimeout(() => {
        if (window.opener) {
          window.close();
        } else {
          router.push("/settings");
        }
      }, 3000);
      return;
    }

    if (!code) {
      setStatus("No authorization code received");
      toast.error("Connection failed");
      setTimeout(() => router.push("/settings"), 2000);
      return;
    }

    const saveTokens = async () => {
      try {
        const token = localStorage.getItem("mf_token");
        if (!token) {
          throw new Error("Not authenticated");
        }

        await api.post(
          "/gmail/save-tokens",
          { code },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        setStatus("Gmail connected successfully!");
        toast.success("Gmail connected!");

        // Notify parent window if it exists
        if (window.opener) {
          window.opener.postMessage({ type: "gmail_connected" }, "*");
          setTimeout(() => window.close(), 1500);
        } else {
          setTimeout(() => router.push("/settings"), 2000);
        }
      } catch (err) {
        console.error("Failed to save tokens:", err);
        setStatus("Connection failed");
        toast.error("Failed to connect Gmail");
        setTimeout(() => router.push("/settings"), 2000);
      }
    };

    saveTokens();
  }, [searchParams, router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className="card"
        style={{ padding: 48, textAlign: "center", maxWidth: 400 }}
      >
        <div
          className="spinner"
          style={{ width: 32, height: 32, margin: "0 auto 16px" }}
        />
        <h3>{status}</h3>
        {error && (
          <p style={{ marginTop: 16, color: "var(--red)", fontSize: 13 }}>
            {error}
          </p>
        )}
        <p style={{ marginTop: 16, color: "var(--text-2)", fontSize: 12 }}>
          Please wait...
        </p>
      </div>
    </div>
  );
}
