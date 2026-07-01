import type { ReactNode } from "react";
import { HERCULES_FLOAT, HERCULES_REVEAL } from "@/lib/hercules-theme";

type Props = {
  children: ReactNode;
  title?: string;
  lead?: string;
  eyebrow?: string;
  center?: boolean;
  narrow?: boolean;
  panel?: boolean;
  className?: string;
};

export function HerculesPageShell({
  children,
  title,
  lead,
  eyebrow,
  center = false,
  narrow = false,
  panel = false,
  className = "",
}: Props) {
  return (
    <div className={`hercules-page ${HERCULES_REVEAL} ${className}`.trim()}>
      <div className={`hercules-page__inner ${narrow ? "hercules-page__inner--narrow" : ""}`}>
        {(eyebrow || title || lead) && (
          <header className={`hercules-page__head ${center ? "hercules-page__head--center" : ""}`}>
            {eyebrow ? <p className="hercules-page__eyebrow">{eyebrow}</p> : null}
            {title ? <h1 className="hercules-page__title">{title}</h1> : null}
            {lead ? <p className="hercules-page__lead">{lead}</p> : null}
          </header>
        )}
        {panel ? <div className={`hercules-page__panel ${HERCULES_FLOAT}`}>{children}</div> : children}
      </div>
    </div>
  );
}
