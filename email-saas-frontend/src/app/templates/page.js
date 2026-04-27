// src/app/templates/page.js
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, Trash2, ChevronRight, Clock, Plus, Tag } from "lucide-react";
import { templatesAPI } from "@/lib/api";
import Navbar from "@/components/Navbar";
import toast from "react-hot-toast";

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    templatesAPI
      .list()
      .then((r) => setTemplates(r.data.templates || []))
      .catch(() => toast.error("Failed to load templates"))
      .finally(() => setLoading(false));
  }, []);

  const del = async (id, e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!confirm("Delete this template?")) return;
    try {
      await templatesAPI.delete(id);
      setTemplates((p) => p.filter((t) => (t._id || t.id) !== id));
      toast.success("Template deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />

      <div
        className="content-container"
        style={{ paddingTop: 48, paddingBottom: 80 }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 40,
          }}
        >
          <div>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--accent)",
                display: "block",
                marginBottom: 8,
              }}
            >
              Templates
            </span>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 28,
                fontWeight: 800,
                color: "var(--text-1)",
              }}
            >
              Saved templates
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-2)", marginTop: 6 }}>
              Reuse a template to skip the generation step.
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => router.push("/compose")}
          >
            <Plus size={15} /> New template
          </button>
        </div>

        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 0",
              color: "var(--text-3)",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
            }}
          >
            Loading…
          </div>
        ) : templates.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                margin: "0 auto 16px",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Archive size={24} color="var(--text-3)" />
            </div>
            <p
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "var(--text-1)",
                marginBottom: 6,
              }}
            >
              No templates yet
            </p>
            <p
              style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 24 }}
            >
              Generate an email and save it as a template to reuse it later.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => router.push("/compose")}
            >
              Create first template
            </button>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: 6 }}
            className="stagger"
          >
            {templates.map((t) => {
              const id = t._id || t.id;
              return (
                <div
                  key={id}
                  onClick={() => router.push("/compose")}
                  className="card animate-fadeUp"
                  style={{
                    padding: "18px 20px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 4,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "var(--text-1)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {t.name}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          padding: "2px 8px",
                          borderRadius: 20,
                          flexShrink: 0,
                          fontFamily: "var(--font-mono)",
                          letterSpacing: "0.05em",
                          background:
                            t.tone === "formal"
                              ? "rgba(96,165,250,0.12)"
                              : "rgba(249,115,22,0.12)",
                          color:
                            t.tone === "formal" ? "var(--blue)" : "#FB923C",
                          border:
                            t.tone === "formal"
                              ? "1px solid rgba(96,165,250,0.2)"
                              : "1px solid rgba(249,115,22,0.2)",
                        }}
                      >
                        {t.tone}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--text-2)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        marginBottom: 8,
                      }}
                    >
                      {t.subject}
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 16 }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--text-3)",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Clock size={10} />{" "}
                        {new Date(t.createdAt).toLocaleDateString()}
                      </span>
                      {t.keywords?.length > 0 && (
                        <span
                          style={{
                            fontSize: 11,
                            color: "var(--text-3)",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <Tag size={10} /> {t.keywords.length} fields
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      marginLeft: 16,
                      flexShrink: 0,
                    }}
                  >
                    <button
                      className="btn btn-icon"
                      onClick={(e) => del(id, e)}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                    <ChevronRight size={16} color="var(--text-3)" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
