// src/app/compose/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Check,
  Save,
} from "lucide-react";
import toast from "react-hot-toast";
import { generateAPI, templatesAPI } from "@/lib/api";
import Navbar from "@/components/Navbar";
import StepBar from "@/components/StepBar";
import RecipientsStep from "@/components/RecipientsStep";

const STEPS = ["Subject", "Fields & Tone", "Generate", "Recipients", "Send"];

const ALL_FIELDS = [
  { key: "toName", label: "To Name" },
  { key: "companyName", label: "Company/Organization Name" }, // Generic
  { key: "date", label: "Date" },
  { key: "time", label: "Time" },
  { key: "productName", label: "Product/Service Name" }, // Generic
  { key: "amount", label: "Amount/Price" },
  { key: "location", label: "Location" },
  { key: "deadline", label: "Deadline" },
  { key: "phone", label: "Phone Number" },
  { key: "website", label: "Website URL" },
  { key: "jobTitle", label: "Job Title" },
  { key: "reason", label: "Reason/Context" },
];
export default function ComposePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Step 0
  const [subject, setSubject] = useState("");

  // Step 1 - Fields & Tone
  const [selectedFields, setSelectedFields] = useState(["toName"]);
  const [tone, setTone] = useState("formal");
  const [fieldValues, setFieldValues] = useState({ fromName: "" });

  // Step 2 - Generated email
  const [bodyText, setBodyText] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [feedback, setFeedback] = useState("");
  const [saveName, setSaveName] = useState("");
  const [saved, setSaved] = useState(false);

  const setFv = (k, v) => setFieldValues((p) => ({ ...p, [k]: v }));

  const toggleField = (key) => {
    setSelectedFields((p) =>
      p.includes(key) ? p.filter((k) => k !== key) : [...p, key],
    );
    if (!selectedFields.includes(key)) setFv(key, "");
  };

  const handleSuggest = async () => {
    if (!subject.trim()) {
      toast.error("Enter a subject first");
      return;
    }

    setLoading(true);
    try {
      const res = await generateAPI.suggestFields(subject);
      console.log("Suggested fields response:", res.data);

      const suggestedFieldsArray =
        res.data.data?.suggestedFields || res.data.suggestedFields || [];

      if (suggestedFieldsArray.length > 0) {
        setSelectedFields((prev) => {
          const merged = [...new Set([...prev, ...suggestedFieldsArray])];
          return merged;
        });

        suggestedFieldsArray.forEach((field) => {
          if (!fieldValues[field]) {
            let defaultValue = "";
            if (field === "toName") defaultValue = "[Recipient Name]";
            else if (field === "companyName") defaultValue = "[Company Name]";
            else if (field === "productName") defaultValue = "[Product Name]";
            else if (field === "date") defaultValue = "[Date]";
            else if (field === "amount") defaultValue = "[Amount]";
            else if (field === "location") defaultValue = "[Location]";
            else defaultValue = `[${field}]`;

            setFieldValues((prev) => ({ ...prev, [field]: defaultValue }));
          }
        });

        toast.success(
          `Added ${suggestedFieldsArray.length} personalization fields`,
        );
      } else {
        toast.info("No fields suggested, you can add manually");
      }
    } catch (err) {
      console.error("Suggest fields error:", err);
      toast.error("Could not get suggestions, please add fields manually");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    const allKeys = ["fromName", ...selectedFields];
    const missing = allKeys.filter((k) => !fieldValues[k]?.trim());
    if (missing.length) {
      toast.error(`Fill in: ${missing.join(", ")}`);
      return;
    }

    setLoading(true);
    try {
      console.log("Sending request:", {
        subject,
        tone,
        selectedFields,
        fieldValues,
      });

      const res = await generateAPI.emailBody({
        subject,
        tone,
        selectedFields: selectedFields,
        ...fieldValues,
      });

      console.log("Response:", res.data);

      if (res.data && res.data.data) {
        setBodyText(res.data.data.bodyText || res.data.data.body || "");
        setBodyHtml(res.data.data.bodyHtml || "");
        setSaveName(`Campaign — ${subject}`);
        setStep(2);
        toast.success("Email generated successfully!");
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Generation error:", err);
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        "Generation failed";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      const res = await generateAPI.regenerate({
        previousBody: bodyText,
        subject,
        tone,
        feedback,
      });
      setBodyText(res.data.data?.bodyText || res.data.bodyText || "");
      setBodyHtml(res.data.data?.bodyHtml || res.data.bodyHtml || "");
      setFeedback("");
      toast.success("Regenerated!");
    } catch {
      toast.error("Regeneration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!saveName.trim()) {
      toast.error("Enter a template name");
      return;
    }
    try {
      await templatesAPI.create({
        name: saveName,
        subject,
        fromName: fieldValues.fromName,
        tone,
        keywords: selectedFields,
        bodyHtml,
        bodyText,
      });
      setSaved(true);
      toast.success("Template saved!");
    } catch {
      toast.error("Could not save template");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />

      <div
        className="content-container"
        style={{ paddingTop: 48, paddingBottom: 80 }}
      >
        {/* Back + Steps */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 40,
          }}
        >
          <button
            onClick={() =>
              step === 0 ? router.push("/dashboard") : setStep((s) => s - 1)
            }
            className="btn btn-ghost btn-icon"
          >
            <ArrowLeft size={17} />
          </button>
          <StepBar steps={STEPS} current={step} />
        </div>

        {/* STEP 0: Subject */}
        {step === 0 && (
          <div className="animate-fadeUp">
            <div className="section-header">
              <span className="eyebrow">Step 1 of 5</span>
              <h1>What's your email about?</h1>
              <p>
                Enter a subject line. AI will suggest the most relevant
                personalization fields.
              </p>
            </div>

            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">Email subject</label>
              <input
                className="input"
                autoFocus
                style={{ fontSize: 16, padding: "14px 16px" }}
                placeholder="e.g. Follow-up on our call yesterday"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && subject.trim()) {
                    handleSuggest();
                    setStep(1);
                  }
                }}
              />
            </div>

            <button
              className="btn btn-primary"
              style={{ padding: "12px 24px" }}
              onClick={() => {
                if (!subject.trim()) {
                  toast.error("Enter a subject first");
                  return;
                }
                handleSuggest();
                setStep(1);
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner spinner-dark" /> Analysing…
                </>
              ) : (
                <>
                  Continue <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        )}

        {/* STEP 1: Fields & Tone */}
        {step === 1 && (
          <div className="animate-fadeUp">
            <div className="section-header">
              <span className="eyebrow">Step 2 of 5</span>
              <h1>Fields & tone</h1>
              <p>Choose what to personalize and how the email should sound.</p>
            </div>

            {/* Tone */}
            <div style={{ marginBottom: 28 }}>
              <label
                className="form-label"
                style={{ display: "block", marginBottom: 10 }}
              >
                Tone
              </label>
              <div style={{ display: "flex", gap: 10 }}>
                {["formal", "casual"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`tone-btn ${tone === t ? "on" : "off"}`}
                  >
                    {t === "formal" ? "🎩 Formal" : "😊 Casual"}
                  </button>
                ))}
              </div>
            </div>

            {/* From Name */}
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">
                From name <span style={{ color: "var(--accent)" }}>*</span>
              </label>
              <input
                className="input"
                placeholder="Your name or brand"
                value={fieldValues.fromName || ""}
                onChange={(e) => setFv("fromName", e.target.value)}
              />
            </div>

            {/* Field chips */}
            <div style={{ marginBottom: 28 }}>
              <label
                className="form-label"
                style={{ display: "block", marginBottom: 10 }}
              >
                Personalization fields
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {ALL_FIELDS.map((f) => (
                  <button
                    key={f.key}
                    className={`chip ${selectedFields.includes(f.key) ? "active" : ""}`}
                    onClick={() => toggleField(f.key)}
                  >
                    {selectedFields.includes(f.key) && (
                      <Check size={11} strokeWidth={3} />
                    )}
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Fill values - optional */}
            {selectedFields.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <label
                  className="form-label"
                  style={{ display: "block", marginBottom: 12 }}
                >
                  Example values (optional - for preview only)
                  <span
                    style={{
                      color: "var(--text-3)",
                      fontSize: 11,
                      marginLeft: 8,
                    }}
                  >
                    Recipients can override these later
                  </span>
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  {selectedFields.map((key) => {
                    const f = ALL_FIELDS.find((x) => x.key === key);
                    return (
                      <div key={key} className="form-group">
                        <label className="form-label">{f?.label || key}</label>
                        <input
                          className="input"
                          style={{ fontSize: 13 }}
                          placeholder={`Example ${f?.label || key} (optional)`}
                          value={fieldValues[key] || ""}
                          onChange={(e) => setFv(key, e.target.value)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              className="btn btn-primary"
              style={{ padding: "12px 24px" }}
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner spinner-dark" /> Generating…
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Generate email
                </>
              )}
            </button>
          </div>
        )}

        {/* STEP 2: Review */}
        {step === 2 && (
          <div className="animate-fadeUp">
            <div className="section-header">
              <span className="eyebrow">Step 3 of 5</span>
              <h1>Review your email</h1>
              <p>
                Edit the body directly, regenerate with feedback, or save as a
                reusable template.
              </p>
            </div>

            {/* Preview */}
            <div
              className="card"
              style={{ marginBottom: 16, overflow: "hidden" }}
            >
              <div
                style={{
                  padding: "12px 18px",
                  borderBottom: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: "var(--surface-2)",
                }}
              >
                <span className="form-label" style={{ margin: 0 }}>
                  Subject
                </span>
                <span style={{ fontSize: 13, color: "var(--text-2)" }}>
                  {subject}
                </span>
              </div>
              <textarea
                className="input"
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                style={{
                  border: "none",
                  borderRadius: 0,
                  background: "transparent",
                  minHeight: 220,
                  fontSize: 14,
                  lineHeight: 1.7,
                  padding: "20px",
                  color: "var(--text-1)",
                }}
              />
            </div>

            {/* Regenerate */}
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              <input
                className="input"
                style={{ fontSize: 13 }}
                placeholder="Feedback for regeneration (optional)…"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
              <button
                className="btn btn-secondary"
                style={{ whiteSpace: "nowrap", padding: "10px 16px" }}
                onClick={handleRegenerate}
                disabled={loading}
              >
                <RefreshCw
                  size={14}
                  className={loading ? "animate-spin" : ""}
                />
                Regenerate
              </button>
            </div>

            {/* Save template */}
            <div
              className="card-flat"
              style={{ padding: "16px 18px", marginBottom: 28 }}
            >
              <label
                className="form-label"
                style={{ display: "block", marginBottom: 10 }}
              >
                Save as template (optional)
              </label>
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  className="input"
                  style={{ fontSize: 13 }}
                  placeholder="Template name…"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                />
                <button
                  className="btn btn-secondary"
                  style={{ whiteSpace: "nowrap", padding: "10px 16px" }}
                  onClick={handleSaveTemplate}
                  disabled={saved}
                >
                  {saved ? (
                    <Check size={14} />
                  ) : (
                    <>
                      <Save size={14} /> Save
                    </>
                  )}
                </button>
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ padding: "12px 24px" }}
              onClick={() => setStep(3)}
            >
              Continue to recipients <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* STEPS 3 & 4: Recipients + Send */}
        {step >= 3 && (
          <RecipientsStep
            step={step}
            setStep={setStep}
            subject={subject}
            fromName={fieldValues.fromName}
            tone={tone}
            bodyHtml={bodyHtml}
            bodyText={bodyText}
            selectedFields={selectedFields}
            exampleFieldValues={fieldValues}
          />
        )}
      </div>
    </div>
  );
}
