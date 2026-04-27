"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Archive,
  ChevronRight,
  Send,
  Clock,
  TrendingUp,
  Mail,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { templatesAPI, campaignsAPI } from "@/lib/api";
import Navbar from "@/components/Navbar";
import toast from "react-hot-toast";

export default function Dashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [templatesRes, campaignsRes] = await Promise.all([
          templatesAPI.list().catch(() => ({ data: { templates: [] } })),
          campaignsAPI.list().catch(() => ({ data: { campaigns: [] } })),
        ]);
        setTemplates(templatesRes.data.templates || []);
        setCampaigns(campaignsRes.data.campaigns || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Don't show toast for every error, just set empty arrays
        setTemplates([]);
        setCampaigns([]);
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [user, loading, router]);

  if (loading || !user) return null;

  const totalSent = campaigns.reduce((a, c) => a + (c.sentCount || 0), 0);
  const totalFailed = campaigns.reduce((a, c) => a + (c.failedCount || 0), 0);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />

      <div className="page-container" style={{ padding: "48px 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: 48 }} className="animate-fadeUp">
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--accent)",
            }}
          >
            Dashboard
          </span>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 32,
              fontWeight: 800,
              color: "var(--text-1)",
              marginTop: 8,
            }}
          >
            Welcome back,{" "}
            {user.name?.split(" ")[0] || user.email?.split("@")[0] || "User"}
          </h1>
        </div>

        {/* Stats row */}
        {campaigns.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
              marginBottom: 40,
            }}
            className="stagger animate-fadeUp"
          >
            {[
              {
                label: "Campaigns",
                value: campaigns.length,
                color: "var(--text-1)",
                icon: Mail,
              },
              {
                label: "Emails Sent",
                value: totalSent,
                color: "var(--green)",
                icon: Send,
              },
              {
                label: "Failed",
                value: totalFailed,
                color: totalFailed > 0 ? "var(--red)" : "var(--text-1)",
                icon: TrendingUp,
              },
            ].map((s) => (
              <div key={s.label} className="stat-card animate-fadeUp">
                <div className="stat-value" style={{ color: s.color }}>
                  {s.value}
                </div>
                <div
                  style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginBottom: 48,
          }}
          className="stagger animate-fadeUp"
        >
          {/* New campaign */}
          <button
            onClick={() => router.push("/compose")}
            className="card"
            style={{
              padding: 32,
              textAlign: "left",
              cursor: "pointer",
              background: "var(--surface)",
              transition: "all 0.2s",
              display: "block",
              width: "100%",
              border: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: "var(--accent-dim)",
                  border: "1px solid rgba(245,166,35,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Plus size={22} color="var(--accent)" />
              </div>
              <ChevronRight size={16} color="var(--text-3)" />
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 18,
                fontWeight: 700,
                color: "var(--text-1)",
                marginBottom: 8,
              }}
            >
              New campaign
            </div>
            <div
              style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}
            >
              AI-generate a personalized email body, add recipients, validate
              and send.
            </div>
          </button>

          {/* Saved templates */}
          <button
            onClick={() => router.push("/templates")}
            className="card"
            style={{
              padding: 32,
              textAlign: "left",
              cursor: "pointer",
              background: "var(--surface)",
              opacity: templates.length === 0 ? 0.55 : 1,
              display: "block",
              width: "100%",
              border: "1px solid var(--border)",
              transition: "all 0.2s",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: "var(--surface-2)",
                  border: "1px solid var(--border-2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Archive size={22} color="var(--text-2)" />
              </div>
              <ChevronRight size={16} color="var(--text-3)" />
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 18,
                fontWeight: 700,
                color: "var(--text-1)",
                marginBottom: 8,
              }}
            >
              Saved templates
            </div>
            <div
              style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}
            >
              {templates.length > 0
                ? `${templates.length} template${templates.length > 1 ? "s" : ""} ready to reuse.`
                : "No templates yet — generate one first."}
            </div>
          </button>
        </div>

        {/* Recent campaigns */}
        {campaigns.length > 0 && (
          <div className="animate-fadeUp">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--text-3)",
                }}
              >
                Recent campaigns
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {campaigns.slice(0, 8).map((c) => {
                const id = c._id || c.id;
                return (
                  <Link
                    key={id}
                    href={`/campaigns/${id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 18px",
                      borderRadius: 10,
                      textDecoration: "none",
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      transition: "border-color 0.15s",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          flexShrink: 0,
                          background:
                            c.status === "sent"
                              ? "var(--green)"
                              : c.status === "sending"
                                ? "var(--yellow)"
                                : "var(--text-3)",
                        }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: "var(--text-1)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {c.name}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--text-3)",
                            marginTop: 1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {c.subject}
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        flexShrink: 0,
                        marginLeft: 16,
                      }}
                    >
                      <span className={`badge badge-${c.status}`}>
                        {c.status}
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          color: "var(--text-3)",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Mail size={11} /> {c.totalRecipients || 0}
                      </span>
                      <ChevronRight size={14} color="var(--text-3)" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
