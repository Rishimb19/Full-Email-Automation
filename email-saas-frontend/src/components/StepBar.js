// src/components/StepBar.js
import { Check } from "lucide-react";

export default function StepBar({ steps, current }) {
  return (
    <div className="steps-bar" style={{ flexWrap: "wrap", gap: "4px 0" }}>
      {steps.map((label, i) => {
        const state =
          i < current ? "done" : i === current ? "active" : "pending";
        return (
          <div key={i} className="step-item">
            <div className={`step-circle ${state}`}>
              {state === "done" ? <Check size={12} strokeWidth={3} /> : i + 1}
            </div>
            <span className={`step-label ${state}`}>{label}</span>
            {i < steps.length - 1 && (
              <div
                className={`step-connector ${i < current ? "done" : "pending"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
