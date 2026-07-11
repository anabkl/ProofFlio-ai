"use client";

import { CheckCircle2 } from "lucide-react";
import type { OnboardingStep } from "@/lib/onboarding/types";

export function OnboardingProgress({
  steps,
  activeStep,
  onStepChange,
}: {
  steps: Array<{ id: OnboardingStep; label: string; detail: string }>;
  activeStep: OnboardingStep;
  onStepChange: (step: OnboardingStep) => void;
}) {
  const activeIndex = Math.max(0, steps.findIndex((step) => step.id === activeStep));

  return (
    <nav aria-label="Onboarding progress" className="rounded-xl border border-white/10 bg-white/[0.055] p-3">
      <ol className="grid gap-2">
        {steps.map((step, index) => {
          const isActive = step.id === activeStep;
          const isComplete = index < activeIndex;

          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => onStepChange(step.id)}
                className={[
                  "pf-focus grid w-full grid-cols-[32px_1fr] items-start gap-3 rounded-lg border px-3 py-3 text-left transition",
                  isActive
                    ? "border-[#4E8CFF]/55 bg-[#4E8CFF]/14"
                    : "border-white/8 bg-[#070B14]/56 hover:border-white/18",
                ].join(" ")}
                aria-current={isActive ? "step" : undefined}
              >
                <span
                  className={[
                    "grid h-8 w-8 place-items-center rounded-md text-xs font-black",
                    isComplete || isActive ? "bg-[#DDFBFF] text-[#071021]" : "bg-white/8 text-white/56",
                  ].join(" ")}
                >
                  {isComplete ? <CheckCircle2 size={16} /> : index + 1}
                </span>
                <span>
                  <span className="block text-sm font-black text-white">{step.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-white/52">{step.detail}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
