import { INSTITUTIONAL_LEGAL_NOTICE } from "@/lib/financial-compliance";

type Props = {
  className?: string;
  compact?: boolean;
};

export function InstitutionalLegalNotice({ className = "", compact = false }: Props) {
  return (
    <p
      className={`ae-institutional-notice${compact ? " ae-institutional-notice--compact" : ""} ${className}`.trim()}
      role="note"
    >
      {INSTITUTIONAL_LEGAL_NOTICE}
    </p>
  );
}
