"use client";

import { WIZARD_STEPS } from "@/types";

interface WizardProgressProps {
  currentStep: number;
}

export default function WizardProgress({ currentStep }: WizardProgressProps) {
  return (
    <div className="flex items-center justify-between">
      {WIZARD_STEPS.map((s, i) => (
        <div
          key={s.id}
          className="flex items-center"
          style={{ flex: i < WIZARD_STEPS.length - 1 ? 1 : "none" }}
        >
          <div className="flex flex-col items-center">
            <div
              className={`w-[30px] h-[30px] rounded-full flex items-center justify-center text-[13px] font-semibold ${
                currentStep > s.id
                  ? "bg-accent text-white"
                  : currentStep === s.id
                  ? "bg-accent-light text-accent border-2 border-accent"
                  : "bg-subtle text-faint border-2 border-transparent"
              }`}
            >
              {currentStep > s.id ? "✓" : s.id}
            </div>
            <span
              className={`text-[11px] mt-1.5 text-center ${
                currentStep >= s.id
                  ? "text-foreground"
                  : "text-faint"
              } ${currentStep === s.id ? "font-semibold" : "font-normal"}`}
            >
              {s.label}
            </span>
          </div>
          {i < WIZARD_STEPS.length - 1 && (
            <div
              className={`flex-1 h-0.5 mx-2 ${
                currentStep > s.id ? "bg-accent" : "bg-border"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
