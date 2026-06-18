"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { HowItWorksStepModal } from "@/components/home/HowItWorksStepModal";
import { HERCULES_FLOAT } from "@/lib/hercules-theme";
import { HOW_IT_WORKS_STEPS } from "@/lib/how-it-works-steps";

const EXAMPLE = "/m/ona-demo";

export function HomeHowItWorksInteractive() {
  const [active, setActive] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const step = HOW_IT_WORKS_STEPS[active];

  const openStep = useCallback((index: number) => {
    setActive(index);
    setModalOpen(true);
  }, []);

  const goPrev = useCallback(() => {
    setActive((i) => Math.max(0, i - 1));
  }, []);

  const goNext = useCallback(() => {
    setActive((i) => Math.min(HOW_IT_WORKS_STEPS.length - 1, i + 1));
  }, []);

  return (
    <>
      <div className="ae-how-interactive">
        <div className="ae-how-interactive__steps" role="list">
          {HOW_IT_WORKS_STEPS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="listitem"
              className={`ae-how-step ae-how-step--rich${active === i ? " ae-how-step--active" : ""}`}
              onClick={() => openStep(i)}
              aria-pressed={active === i}
              aria-label={`${s.title}. Paspauskite, kad atvertumėte vizualizaciją.`}
            >
              <span className="ae-how-step__thumb-wrap">
                <img src={s.image} alt="" className="ae-how-step__thumb" loading="lazy" />
                <span className="ae-how-step__thumb-overlay" aria-hidden />
                <span className="vk-step-num ae-how-step__num">{s.id}</span>
              </span>
              <span className="ae-how-step__copy">
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <span className="ae-how-step__cta">Atverti vizualizaciją →</span>
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          className={`ae-how-interactive__preview ${HERCULES_FLOAT} hercules-float--static`}
          onClick={() => setModalOpen(true)}
          aria-label={`${step.title} — atverti pilną vizualizaciją`}
        >
          <div className="ae-how-preview" aria-live="polite">
            <div className="ae-how-preview__frame">
              <img
                key={step.id}
                src={step.image}
                alt={step.imageAlt}
                className="ae-how-preview__image ae-how-preview__image--enter"
              />
              <div className="ae-how-preview__shade" aria-hidden />
              <div className="ae-how-preview__caption">
                <span className="ae-how-preview__badge">Žingsnis {step.id}</span>
                <h3>{step.title}</h3>
                <p>{step.detail}</p>
              </div>
            </div>
            <span className="ae-how-preview__hint">Spustelėkite didesniam vaizdui</span>
          </div>
        </button>

        <p className="vk-section__cta ae-how-interactive__cta">
          <Link href={EXAMPLE} className="vk-btn vk-btn--primary">
            Pamatyti gyvą pavyzdį →
          </Link>
        </p>
      </div>

      {modalOpen && (
        <HowItWorksStepModal
          step={step}
          stepIndex={active}
          totalSteps={HOW_IT_WORKS_STEPS.length}
          onClose={() => setModalOpen(false)}
          onPrev={goPrev}
          onNext={goNext}
        />
      )}
    </>
  );
}
