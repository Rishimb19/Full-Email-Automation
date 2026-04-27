// src/app/campaigns/[id]/page.js
"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Mail, CheckCircle, XCircle, Clock } from "lucide-react";
import { sendAPI } from "@/lib/api";
import Navbar from "@/components/Navbar";
import toast from "react-hot-toast";

export default function CampaignDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchDetails = async () => {
      try {
        const res = await sendAPI.results(id);
        setCampaign(res.data.data?.campaign || res.data.campaign);
        setRecipients(res.data.data?.recipients || res.data.recipients || []);
      } catch (error) {
        console.error("Failed to fetch campaign:", error);
        toast.error("Campaign not found");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  if (loading) {
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
        <button
          onClick={() => router.push("/dashboard")}
          className="btn btn-ghost"
          style={{ marginBottom: 32, padding: "8px 0", gap: 8 }}
        >
          <ArrowLeft size={15} /> Dashboard
        </button>

        <div className="section-header">
          <span className="eyebrow">Campaign Details</span>
          <h1>{campaign?.subject || "Campaign"}</h1>
          <p>Status: {campaign?.status || "Unknown"}</p>
        </div>

        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <h3>Summary</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
              marginTop: 16,
            }}
          >
            <div>
              <div className="stat-value" style={{ color: "var(--green)" }}>
                {campaign?.sentCount || 0}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-3)" }}>Sent</div>
            </div>
            <div>
              <div className="stat-value" style={{ color: "var(--red)" }}>
                {campaign?.failedCount || 0}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-3)" }}>Failed</div>
            </div>
            <div>
              <div className="stat-value">{campaign?.totalRecipients || 0}</div>
              <div style={{ fontSize: 12, color: "var(--text-3)" }}>Total</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h3>Recipients</h3>
          <div style={{ marginTop: 16 }}>
            {recipients.map((r, i) => (
              <div
                key={i}
                className="recipient-row"
                style={{ marginBottom: 8 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Mail size={13} color="var(--text-3)" />
                  <span>{r.email}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      color:
                        r.status === "sent"
                          ? "var(--green)"
                          : r.status === "failed"
                            ? "var(--red)"
                            : "var(--yellow)",
                    }}
                  >
                    {r.status || "pending"}
                  </span>
                  {r.status === "sent" ? (
                    <CheckCircle size={14} color="var(--green)" />
                  ) : r.status === "failed" ? (
                    <XCircle size={14} color="var(--red)" />
                  ) : (
                    <Clock size={14} color="var(--yellow)" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
