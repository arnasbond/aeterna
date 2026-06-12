"use client";

import {
  WIZARD_GDPR_SUMMARY,
  WIZARD_MAP_CONSENT_SUMMARY,
  WIZARD_PRIVACY_PRIVATE_SUMMARY,
  WIZARD_PRIVACY_PUBLIC_SUMMARY,
  WIZARD_TERMS_SUMMARY,
} from "@/lib/wizard-policies";

export type WizardPrivacyValues = {
  privacyStatus: "public" | "private" | "";
  consentTerms: boolean;
  consentPrivacy: boolean;
  consentMapLocation: boolean;
};

type Props = {
  values: WizardPrivacyValues;
  onChange: (patch: Partial<WizardPrivacyValues>) => void;
};

export function WizardPrivacyStep({ values, onChange }: Props) {
  return (
    <div className="ae-wizard-privacy">
      <h2 style={{ fontSize: "1.2rem" }}>2. Privatumas ir sutikimai</h2>
      <p style={{ fontSize: "0.9rem", color: "var(--ae-muted)", marginBottom: "1rem", lineHeight: 1.6 }}>
        Prieš tęsdami pasirinkite, kaip bus rodomas memorialas, ir patvirtinkite sutikimus. Šių nustatymų anksčiau
        vedlyje nebuvo — dabar viskas aiškiai ir jūsų valia.
      </p>

      <fieldset className="ae-wizard-privacy__fieldset">
        <legend className="ae-wizard-privacy__legend">Memorialo matomumas *</legend>
        <div className="ae-wizard-privacy__choices">
          <label
            className={`ae-wizard-privacy__card${values.privacyStatus === "public" ? " ae-wizard-privacy__card--on" : ""}`}
          >
            <input
              type="radio"
              name="privacyStatus"
              value="public"
              checked={values.privacyStatus === "public"}
              onChange={() => onChange({ privacyStatus: "public" })}
            />
            <span className="ae-wizard-privacy__card-title">Viešas memorialas</span>
            <span className="ae-wizard-privacy__card-text">{WIZARD_PRIVACY_PUBLIC_SUMMARY}</span>
          </label>
          <label
            className={`ae-wizard-privacy__card${values.privacyStatus === "private" ? " ae-wizard-privacy__card--on" : ""}`}
          >
            <input
              type="radio"
              name="privacyStatus"
              value="private"
              checked={values.privacyStatus === "private"}
              onChange={() => onChange({ privacyStatus: "private" })}
            />
            <span className="ae-wizard-privacy__card-title">Privatus memorialas</span>
            <span className="ae-wizard-privacy__card-text">{WIZARD_PRIVACY_PRIVATE_SUMMARY}</span>
          </label>
        </div>
      </fieldset>

      <fieldset className="ae-wizard-privacy__fieldset">
        <legend className="ae-wizard-privacy__legend">Privalomi sutikimai *</legend>
        <label className="ae-wizard-privacy__check">
          <input
            type="checkbox"
            checked={values.consentTerms}
            onChange={(e) => onChange({ consentTerms: e.target.checked })}
          />
          <span>{WIZARD_TERMS_SUMMARY}</span>
        </label>
        <label className="ae-wizard-privacy__check">
          <input
            type="checkbox"
            checked={values.consentPrivacy}
            onChange={(e) => onChange({ consentPrivacy: e.target.checked })}
          />
          <span>{WIZARD_GDPR_SUMMARY}</span>
        </label>
      </fieldset>

      <fieldset className="ae-wizard-privacy__fieldset">
        <legend className="ae-wizard-privacy__legend">Papildomas pasirinkimas</legend>
        <label className="ae-wizard-privacy__check">
          <input
            type="checkbox"
            checked={values.consentMapLocation}
            onChange={(e) => onChange({ consentMapLocation: e.target.checked })}
          />
          <span>{WIZARD_MAP_CONSENT_SUMMARY}</span>
        </label>
      </fieldset>
    </div>
  );
}

export function isWizardPrivacyComplete(values: WizardPrivacyValues): boolean {
  return (
    (values.privacyStatus === "public" || values.privacyStatus === "private") &&
    values.consentTerms &&
    values.consentPrivacy
  );
}
