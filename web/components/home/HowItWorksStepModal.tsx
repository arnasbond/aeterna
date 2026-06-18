"use client";

import { useEffect } from "react";
import type { HowItWorksStep } from "@/lib/how-it-works-steps";

type Props = {
  step: HowItWorksStep;
  stepIndex: number;
  totalSteps: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

export function HowItWorksStepModal({ step, stepIndex, totalSteps, onClose, onPrev, onNext }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, onPrev, onNext]);

  return (
    <div className="ae-how-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="ae-how-modal"
        role="dialog"
        aria-modal
        aria-labelledby={`ae-how-modal-title-${step.id}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="ae-how-modal__close" onClick={onClose} aria-label="Uždaryti">
          ×
        </button>

        <div className="ae-how-modal__visual">
          <img src={step.image} alt={step.imageAlt} className="ae-how-modal__image" />
          <div className="ae-how-modal__visual-overlay" aria-hidden />
          <span className="ae-how-modal__step-badge">Žingsnis {step.id}</span>
        </div>

        <div className="ae-how-modal__body">
          <h2 id={`ae-how-modal-title-${step.id}`} className="ae-how-modal__title">
            {step.title}
          </h2>
          <p className="ae-how-modal__lead">{step.text}</p>
          <p className="ae-how-modal__detail">{step.detail}</p>

          <div className="ae-how-modal__nav">
            <button
              type="button"
              className="vk-btn vk-btn--outline"
              onClick={onPrev}
              disabled={stepIndex === 0}
            >
              ← Ankstesnis
            </button>
            <span className="ae-how-modal__counter">
              {stepIndex + 1} / {totalSteps}
            </span>
            {stepIndex < totalSteps - 1 ? (
              <button type="button" className="vk-btn vk-btn--primary" onClick={onNext}>
                Kitas žingsnis →
              </button>
            ) : (
              <button type="button" className="vk-btn vk-btn--primary" onClick={onClose}>
                Supratau
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
