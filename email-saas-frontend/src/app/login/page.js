// src/app/login/page.js
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import {
  Send,
  Mail,
  Lock,
  User,
  ArrowRight,
  Zap,
  Shield,
  BarChart3,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const FEATURES = [
  {
    icon: Zap,
    title: "AI Generation",
    desc: "Groq AI writes personalized email bodies from your subject and tone.",
  },
  {
    icon: Shield,
    title: "Email Validation",
    desc: "Free email validation checks every address — invalid ones are auto-skipped.",
  },
  {
    icon: BarChart3,
    title: "Bulk Delivery",
    desc: "Send to up to 5 recipients at a time via Gmail with real-time tracking.",
  },
];

function LoginContent() {
  const router = useRouter();
  const { login, register, googleSignIn } = useAuth();
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
        router.push("/dashboard");
      } else {
        if (!form.name.trim()) {
          toast.error("Name is required");
          setLoading(false);
          return;
        }
        await register(form.name, form.email, form.password);
        router.push("/dashboard");
      }
    } catch (err) {
      // Error already shown in toast by AuthContext
      console.error("Auth error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      await googleSignIn(credentialResponse.credential);
      router.push("/dashboard");
    } catch (err) {
      toast.error("Google sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", background: "var(--bg)" }}
    >
      {/* Left Panel */}
      <div
        className="bg-grid"
        style={{
          width: 480,
          flexShrink: 0,
          padding: "48px 48px",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -80,
            left: -80,
            width: 320,
            height: 320,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(245,166,35,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            position: "relative",
          }}
        >
          <div className="navbar-logo-icon">
            <Send size={16} strokeWidth={2.5} />
          </div>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 20,
              fontWeight: 800,
              color: "var(--text-1)",
            }}
          >
            MailForge
          </span>
        </div>

        <div style={{ position: "relative" }}>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: 14,
            }}
          >
            AI Email Campaigns
          </p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 36,
              fontWeight: 800,
              lineHeight: 1.2,
              color: "var(--text-1)",
              marginBottom: 16,
            }}
          >
            Send smarter.
            <br />
            <span style={{ color: "var(--accent)" }}>Not harder.</span>
          </h1>
          <p
            style={{
              fontSize: 15,
              color: "var(--text-2)",
              lineHeight: 1.7,
              maxWidth: 340,
            }}
          >
            Generate AI-personalized emails, validate addresses, and send bulk
            campaigns — all in one flow.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            position: "relative",
          }}
        >
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} style={{ display: "flex", gap: 14 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  flexShrink: 0,
                  background: "var(--surface-2)",
                  border: "1px solid var(--border-2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={16} color="var(--accent)" />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text-1)",
                    marginBottom: 2,
                  }}
                >
                  {title}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text-3)",
                    lineHeight: 1.5,
                  }}
                >
                  {desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
        }}
      >
        <div
          style={{ width: "100%", maxWidth: 400 }}
          className="animate-fadeUp"
        >
          {/* Mode Toggle */}
          <div
            style={{
              display: "flex",
              background: "var(--surface-2)",
              borderRadius: 10,
              padding: 4,
              marginBottom: 32,
              border: "1px solid var(--border)",
            }}
          >
            <button
              onClick={() => setMode("login")}
              style={{
                flex: 1,
                padding: "9px 0",
                borderRadius: 7,
                border: "none",
                fontFamily: "var(--font-display)",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s",
                background:
                  mode === "login" ? "var(--surface-3)" : "transparent",
                color: mode === "login" ? "var(--text-1)" : "var(--text-3)",
              }}
            >
              Sign in
            </button>
            <button
              onClick={() => setMode("register")}
              style={{
                flex: 1,
                padding: "9px 0",
                borderRadius: 7,
                border: "none",
                fontFamily: "var(--font-display)",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s",
                background:
                  mode === "register" ? "var(--surface-3)" : "transparent",
                color: mode === "register" ? "var(--text-1)" : "var(--text-3)",
              }}
            >
              Create account
            </button>
          </div>

          {/* Email/Password Form */}
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            {mode === "register" && (
              <div className="form-group">
                <label className="form-label">Full name</label>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <User size={15} />
                  </span>
                  <input
                    className="input"
                    type="text"
                    placeholder="Jane Smith"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email address</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <Mail size={15} />
                </span>
                <input
                  className="input"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <Lock size={15} />
                </span>
                <input
                  className="input"
                  type="password"
                  placeholder={
                    mode === "register"
                      ? "Min. 6 characters"
                      : "Enter your password"
                  }
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ marginTop: 8, padding: "13px 20px", fontSize: 15 }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner spinner-dark" />{" "}
                  {mode === "login" ? "Signing in…" : "Creating account…"}
                </>
              ) : (
                <>
                  {mode === "login" ? "Sign in" : "Create account"}{" "}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              margin: "24px 0",
            }}
          >
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span style={{ fontSize: 12, color: "var(--text-3)" }}>OR</span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          {/* Google Sign In Button */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google sign in failed")}
              text="signin_with"
              shape="rectangular"
              width="100%"
            />
          </div>

          <p
            style={{
              marginTop: 28,
              textAlign: "center",
              fontSize: 12,
              color: "var(--text-3)",
            }}
          >
            By continuing you agree to our terms of service.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    console.warn("Google Client ID not found. Google Sign-In disabled.");
    return <LoginContent />;
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <LoginContent />
    </GoogleOAuthProvider>
  );
}
