import React from "react";
import clsx from "clsx";

interface StepperItem {
  id: string;
  title: string;
  subtitle?: string;
}

interface StepperProps {
  steps: StepperItem[];
  currentIndex: number;
  onChange?: (index: number) => void;
}

function Stepper(props: StepperProps) {
  const { steps, currentIndex, onChange } = props;

  return (
    <div className="flex items-stretch gap-3 text-[11px]">
      {steps.map((step, index) => {
        const active = index === currentIndex;
        const completed = index < currentIndex;
        const disabled = index > currentIndex;

        return (
          <button
            key={step.id}
            type="button"
            disabled={disabled}
            onClick={() => {
              if (completed) {
                onChange?.(index);
              }
            }}
            className={clsx(
              "flex-1 rounded-[var(--radius-base)] border px-3 py-2 text-left transition-colors",
              disabled && "cursor-default opacity-70",
              active &&
                "border-[var(--primary-color)] bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)]",
              completed &&
                !active &&
                "border-[var(--primary-color)]/70 bg-[var(--bg-elevated)]",
              !active && !completed && "border-[var(--border-color)] bg-[var(--bg-elevated)]/40",
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={clsx(
                  "inline-flex h-4 w-4 items-center justify-center rounded-full border text-[10px]",
                  active &&
                    "border-[var(--primary-color)] text-[var(--primary-color)] bg-[rgba(83,123,249,0.08)]",
                  completed &&
                    "border-[var(--primary-color)] bg-[var(--primary-color)] text-[var(--bg-elevated)]",
                  !active && !completed && "border-[var(--border-color)] text-[var(--text-color-secondary)]",
                )}
              >
                {index + 1}
              </span>
              <span
                className={clsx(
                  "font-medium",
                  active ? "text-[var(--text-color)]" : "text-[var(--text-color-secondary)]",
                )}
              >
                {step.title}
              </span>
            </div>
            {step.subtitle ? (
              <div className="mt-1 text-[10px] text-[var(--text-color-secondary)]">{step.subtitle}</div>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export default Stepper;

