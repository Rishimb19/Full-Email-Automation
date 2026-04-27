// src/components/RecipientsStep.js
"use client";
import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import {
  Upload,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Shield,
  Send,
  X,
  ChevronRight,
  Mail,
  Download,
} from "lucide-react";
import toast from "react-hot-toast";
import { recipientsAPI, validateAPI, campaignsAPI, sendAPI } from "@/lib/api";

export default function RecipientsStep({
  step,
  setStep,
  subject,
  fromName,
  tone,
  bodyHtml,
  bodyText,
  selectedFields = [],
  exampleFieldValues = {},
}) {
  const router = useRouter();

  const [recipients, setRecipients] = useState([]);
  const [manualEmail, setManualEmail] = useState("");
  const [manualFields, setManualFields] = useState({});
  const [fileLoading, setFileLoading] = useState(false);

  const [modal, setModal] = useState(null);
  const [modalFills, setModalFills] = useState({});

  const [validation, setValidation] = useState([]);
  const [validating, setValidating] = useState(false);

  const [campaignName, setCampaignName] = useState(`Campaign — ${subject}`);
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState(null);

  const recipientFields = selectedFields.filter((f) => f !== "fromName");

  // Initialize manual fields with example values
  useEffect(() => {
    const preFilled = {};
    recipientFields.forEach((field) => {
      if (exampleFieldValues[field]) {
        preFilled[field] = exampleFieldValues[field];
      } else {
        preFilled[field] = "";
      }
    });
    setManualFields(preFilled);
  }, [recipientFields, exampleFieldValues]);

  // File drop handler
  const onDrop = useCallback(
    async (files) => {
      const file = files[0];
      if (!file) return;
      setFileLoading(true);
      try {
        const form = new FormData();
        form.append("file", file);
        const res = await recipientsAPI.parseFile(form);
        const { records, emailColumn } = res.data;

        if (!emailColumn) {
          toast.error('No "email" column found in file');
          return;
        }

        const enhancedRecords = records.map((record) => {
          const enhanced = { ...record };
          recipientFields.forEach((field) => {
            if (!enhanced[field] && exampleFieldValues[field]) {
              enhanced[field] = exampleFieldValues[field];
            }
          });
          return enhanced;
        });

        setRecipients(enhancedRecords);
        toast.success(`${enhancedRecords.length} recipients loaded`);
      } catch (err) {
        toast.error(err.response?.data?.error || "File parse failed");
      } finally {
        setFileLoading(false);
      }
    },
    [recipientFields, exampleFieldValues],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
    maxFiles: 1,
  });

  // Add manual recipient
  const addManual = () => {
    if (!manualEmail.trim()) {
      toast.error("Enter an email");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(manualEmail)) {
      toast.error("Invalid email format");
      return;
    }

    const newRecipient = { email: manualEmail.trim() };
    recipientFields.forEach((field) => {
      if (manualFields[field]) {
        newRecipient[field] = manualFields[field];
      }
    });

    setRecipients((prev) => [...prev, newRecipient]);
    setManualEmail("");
  };

  // Check fields and continue
  const checkAndContinue = async () => {
    console.log("checkAndContinue called, recipients:", recipients.length);

    if (!recipients.length) {
      toast.error("Add at least one recipient");
      return;
    }

    try {
      const res = await recipientsAPI.validateFields({
        recipients: recipients,
        requiredFields: recipientFields,
      });

      const incomplete =
        res.data.data?.results?.filter((r) => !r.isComplete) || [];

      if (incomplete.length === 0) {
        setStep(4);
      } else {
        toast(`${incomplete.length} recipient(s) need field values`, {
          icon: "⚠️",
        });
        openModal(incomplete[0]);
      }
    } catch (error) {
      console.error("Validation error:", error);
      toast.error(error.response?.data?.error?.message || "Validation failed");
    }
  };

  const openModal = (item) => {
    setModal(item);
    setModalFills({});
  };

  const saveModal = async () => {
    const updated = [...recipients];
    updated[modal.index] = { ...updated[modal.index], ...modalFills };
    setRecipients(updated);

    try {
      const res = await recipientsAPI.validateFields({
        recipients: updated,
        requiredFields: recipientFields,
      });

      const remaining =
        res.data.data?.results?.filter((r) => !r.isComplete) || [];

      if (!remaining.length) {
        setModal(null);
        toast.success("All fields complete!");
        setStep(4);
      } else {
        toast(`${remaining.length} more recipient(s) need filling`, {
          icon: "⚠️",
        });
        openModal(remaining[0]);
      }
    } catch (error) {
      toast.error("Failed to validate fields");
    }
  };

  // Validate emails
  const handleValidate = async () => {
    setValidating(true);
    try {
      const emails = recipients
        .map((r) => r.email || r.email_address)
        .filter(Boolean);
      const res = await validateAPI.emails(emails);
      setValidation(res.data.data?.results || []);
      toast.success(`Validated ${emails.length} emails`);
    } catch (error) {
      console.error("Validation error:", error);
      toast.error("Validation failed");
    } finally {
      setValidating(false);
    }
  };

  // Send campaign
  const handleSend = async () => {
    setSending(true);
    try {
      const campaignData = {
        name: campaignName,
        subject,
        fromName,
        tone,
        bodyHtml,
        bodyText,
        recipients: recipients.map((r) => ({
          email: r.email || r.email_address,
          ...r,
        })),
        status: "sending",
      };

      console.log("Creating campaign:", campaignData);
      const c = await campaignsAPI.create(campaignData);
      const campaignId = c.data.data?.campaign?.id || c.data.campaign?.id;

      if (!campaignId) {
        throw new Error("Failed to get campaign ID");
      }

      console.log("Sending campaign:", campaignId);
      const sendResponse = await sendAPI.send(campaignId);
      console.log("Send response:", sendResponse.data);

      // Update UI with results immediately
      if (sendResponse.data?.data?.summary) {
        const summary = sendResponse.data.data.summary;
        toast.success(
          `Sent: ${summary.sent}, Failed: ${summary.failed}, Skipped: ${summary.skipped}`,
        );

        setResults({
          campaign: {
            id: campaignId,
            status: "sent",
            sentCount: summary.sent,
            failedCount: summary.failed,
            invalidCount: summary.skipped || 0,
          },
          recipients: sendResponse.data.data?.details || [],
        });
        console.log("Results saved with campaign ID:", campaignId);
      } else {
        toast.success("Campaign sent successfully!");
        setResults({
          campaign: {
            id: campaignId,
            status: "sent",
            sentCount: recipients.length,
            failedCount: 0,
            invalidCount: 0,
          },
          recipients: recipients.map((r) => ({
            email: r.email,
            status: "sent",
          })),
        });
      }

      setSending(false);
    } catch (err) {
      console.error("Send error:", err);
      toast.error(err.response?.data?.error?.message || "Send failed");
      setSending(false);
    }
  };

  const getValidation = (email) => validation.find((v) => v.email === email);

  // Download CSV template
  const downloadTemplate = () => {
    const headers = ["email", ...recipientFields];
    const sampleRow = [
      `example@email.com`,
      ...recipientFields.map(() => "example"),
    ];
    const csvContent = [headers.join(","), sampleRow.join(",")].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recipients_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // STEP 3: Recipients
  if (step === 3) {
    return (
      <div className="animate-fadeUp">
        <div className="section-header">
          <span className="eyebrow">Step 4 of 5</span>
          <h1>Add recipients</h1>
          <p>
            Upload a CSV / Excel file (must have an{" "}
            <code style={{ color: "var(--accent)", fontSize: 13 }}>email</code>{" "}
            column) or add addresses manually.
          </p>
        </div>

        <button
          onClick={downloadTemplate}
          className="btn btn-secondary"
          style={{ marginBottom: 16, width: "100%", justifyContent: "center" }}
        >
          <Download size={14} /> Download CSV Template
        </button>

        <div
          {...getRootProps()}
          className={`dropzone ${isDragActive ? "active" : ""}`}
          style={{ marginBottom: 20 }}
        >
          <input {...getInputProps()} />
          <Upload
            size={28}
            color="var(--text-3)"
            style={{ margin: "0 auto 12px" }}
          />
          {fileLoading ? (
            <p style={{ color: "var(--text-2)", fontSize: 14 }}>
              Parsing file…
            </p>
          ) : isDragActive ? (
            <p
              style={{ color: "var(--accent)", fontSize: 14, fontWeight: 600 }}
            >
              Drop to upload!
            </p>
          ) : (
            <>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--text-1)",
                  marginBottom: 4,
                }}
              >
                Drop CSV or Excel file here
              </p>
              <p style={{ fontSize: 12, color: "var(--text-3)" }}>
                or click to browse — .csv, .xlsx, .xls supported
              </p>
            </>
          )}
        </div>

        <div
          className="card-flat"
          style={{ padding: "18px", marginBottom: 20 }}
        >
          <label
            className="form-label"
            style={{ display: "block", marginBottom: 12 }}
          >
            Add manually
          </label>
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: recipientFields.length ? 12 : 0,
            }}
          >
            <input
              className="input"
              style={{ fontSize: 13 }}
              placeholder="email@example.com"
              value={manualEmail}
              onChange={(e) => setManualEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addManual()}
            />
            <button className="btn btn-secondary" onClick={addManual}>
              <Plus size={16} />
            </button>
          </div>

          {recipientFields.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              {recipientFields.map((field) => {
                const fieldLabel = field
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase());
                return (
                  <input
                    key={field}
                    className="input"
                    style={{ fontSize: 12 }}
                    placeholder={fieldLabel}
                    value={manualFields[field] || ""}
                    onChange={(e) =>
                      setManualFields((p) => ({
                        ...p,
                        [field]: e.target.value,
                      }))
                    }
                  />
                );
              })}
            </div>
          )}
        </div>

        {recipients.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <span className="form-label">
                {recipients.length} recipients loaded
              </span>
              <button
                onClick={() => setRecipients([])}
                className="btn btn-ghost"
                style={{ padding: 0 }}
              >
                Clear all
              </button>
            </div>
            <div className="scroll-list">
              {recipients.map((r, i) => (
                <div key={i} className="recipient-row">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flex: 1,
                    }}
                  >
                    <Mail size={13} color="var(--text-3)" />
                    <span style={{ fontSize: 13, color: "var(--text-1)" }}>
                      {r.email || r.email_address}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      setRecipients((p) => p.filter((_, j) => j !== i))
                    }
                    className="btn btn-icon"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          className="btn btn-primary"
          style={{
            padding: "12px 24px",
            width: "100%",
            justifyContent: "center",
          }}
          onClick={checkAndContinue}
          disabled={!recipients.length}
        >
          Check fields & continue <ChevronRight size={16} />
        </button>

        {modal && (
          <div className="modal-overlay">
            <div className="modal-box">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 20,
                }}
              >
                <div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <AlertTriangle size={16} color="var(--yellow)" />
                    <span
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: "var(--text-1)",
                      }}
                    >
                      Missing fields
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--text-3)" }}>
                    {modal.email}
                  </p>
                </div>
                <button onClick={() => setModal(null)} className="btn btn-icon">
                  <X size={16} />
                </button>
              </div>

              <div style={{ marginBottom: 20 }}>
                {modal.missingFields?.map((f) => {
                  const fieldLabel = f
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase());
                  return (
                    <div
                      key={f}
                      className="form-group"
                      style={{ marginBottom: 12 }}
                    >
                      <label className="form-label">{fieldLabel}</label>
                      <input
                        className="input"
                        placeholder={`Enter ${fieldLabel}`}
                        value={modalFills[f] || ""}
                        onChange={(e) =>
                          setModalFills((p) => ({ ...p, [f]: e.target.value }))
                        }
                      />
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setModal(null)}
                >
                  Skip
                </button>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={saveModal}
                >
                  Save & continue
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // STEP 4: Validate & Send
  // STEP 4: Validate & Send
  if (step === 4) {
    return (
      <div className="animate-fadeUp">
        <div className="section-header">
          <span className="eyebrow">Step 5 of 5</span>
          <h1>Validate & send</h1>
          <p>Check email quality and send your campaign.</p>
        </div>

        <div className="form-group" style={{ marginBottom: 28 }}>
          <label className="form-label">Campaign name</label>
          <input
            className="input"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <div className="stat-card">
            <div className="stat-value">{recipients.length}</div>
            <div style={{ fontSize: 11, color: "var(--text-3)" }}>Total</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: "var(--green)" }}>
              {validation.filter((v) => v?.status === "valid").length || "—"}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-3)" }}>Valid</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: "var(--red)" }}>
              {validation.filter((v) => v?.status === "invalid").length || "—"}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-3)" }}>Invalid</div>
          </div>
        </div>

        {validation.length === 0 && (
          <button
            className="btn btn-secondary"
            style={{ width: "100%", marginBottom: 16 }}
            onClick={handleValidate}
            disabled={validating}
          >
            {validating ? "Validating..." : "Validate emails"}
          </button>
        )}

        {results && (
          <div
            style={{
              marginBottom: 20,
              padding: 16,
              borderRadius: 8,
              background: "var(--surface-2)",
            }}
          >
            <h4 style={{ marginBottom: 12, color: "var(--text-1)" }}>
              📊 Results:
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 12,
                textAlign: "center",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: "var(--green)",
                  }}
                >
                  {results.campaign?.sentCount || 0}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-3)" }}>Sent</div>
              </div>
              <div>
                <div
                  style={{ fontSize: 24, fontWeight: 700, color: "var(--red)" }}
                >
                  {results.campaign?.failedCount || 0}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-3)" }}>
                  Failed
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: "var(--yellow)",
                  }}
                >
                  {results.campaign?.invalidCount || 0}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-3)" }}>
                  Invalid/Skipped
                </div>
              </div>
            </div>
          </div>
        )}

        {results?.campaign?.status !== "sent" && (
          <button
            className="btn btn-primary"
            style={{
              width: "100%",
              justifyContent: "center",
              padding: "14px",
              fontSize: 15,
            }}
            onClick={handleSend}
            disabled={sending}
          >
            {sending ? (
              <>
                <span className="spinner spinner-dark" /> Sending...
              </>
            ) : (
              <>
                <Send size={16} /> Launch campaign
              </>
            )}
          </button>
        )}

        {/* FIXED BUTTONS SECTION - Replace this whole block */}
        {results?.campaign?.status === "sent" && (
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button
              className="btn btn-secondary"
              style={{ flex: 1, justifyContent: "center" }}
              onClick={() => {
                console.log("Going to dashboard...");
                window.location.href = "/dashboard";
              }}
            >
              Back to dashboard
            </button>
            <button
              className="btn btn-primary"
              style={{ flex: 1, justifyContent: "center" }}
              onClick={() => {
                const campaignId = results.campaign?.id;
                console.log("Campaign ID:", campaignId);
                if (campaignId) {
                  window.location.href = `/campaigns/${campaignId}`;
                } else {
                  toast.error("Campaign ID not found");
                  window.location.href = "/dashboard";
                }
              }}
            >
              View details
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
}
