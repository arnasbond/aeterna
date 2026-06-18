"use client";

import { parishDonationNoteWithAmount, PARISH_DONATION_NOTE } from "@/lib/parish-donation";
import {
  BASE_MEMBERSHIP_CENTS,
  formatPremiumPrice,
  getMembershipPlan,
  MEMBERSHIP_PLANS,
  membershipTotalCents,
  PREMIUM_MONTHLY_CENTS,
  PREMIUM_RETENTION_NOTE,
  PREMIUM_YEARLY_CENTS,
  premiumAddonLabel,
  premiumRenewalLabel,
  type MembershipPlanId,
  type PremiumPlan,
} from "@/lib/premium";
import { formatPrice } from "@/lib/qr-plates";

type Props = {
  planId: MembershipPlanId;
  premiumBilling: PremiumPlan;
  plateAddOnCents?: number;
  parishTitle?: string;
  onPlanChange: (planId: MembershipPlanId) => void;
  onBillingChange: (billing: PremiumPlan) => void;
};

export function MembershipPlanPicker({
  planId,
  premiumBilling,
  plateAddOnCents = 0,
  parishTitle,
  onPlanChange,
  onBillingChange,
}: Props) {
  const totalCents = membershipTotalCents(planId, plateAddOnCents, premiumBilling);

  return (
    <div className="ae-membership-plans">
      <p className="ae-membership-plans__lead">
        Pasirinkite planą. Premium — papildomos galimybės su mėnesine ar metine prenumerata.
      </p>

      <div className="ae-membership-plans__grid" role="radiogroup" aria-label="Narystės planai">
        {MEMBERSHIP_PLANS.map((plan) => {
          const selected = planId === plan.id;
          const planTotal =
            plan.id === "premium"
              ? membershipTotalCents("premium", 0, premiumBilling)
              : BASE_MEMBERSHIP_CENTS;

          return (
            <label
              key={plan.id}
              className={`ae-membership-plan${selected ? " ae-membership-plan--selected" : ""}${plan.popular ? " ae-membership-plan--popular" : ""}`}
            >
              <input
                type="radio"
                name="membership-plan"
                value={plan.id}
                checked={selected}
                onChange={() => onPlanChange(plan.id)}
              />
              <div className="ae-membership-plan__head">
                <span className="ae-membership-plan__name">{plan.name}</span>
                {plan.popular ? <span className="ae-membership-plan__badge">Rekomenduojama</span> : null}
              </div>
              <p className="ae-membership-plan__tagline">{plan.tagline}</p>
              <p className="ae-membership-plan__price">
                {plan.id === "premium" ? (
                  <>
                    {formatPrice(BASE_MEMBERSHIP_CENTS)} + {premiumAddonLabel(premiumBilling)}
                    <span className="ae-membership-plan__price-sub"> (pirmas laikotarpis dabar)</span>
                  </>
                ) : (
                  formatPrice(BASE_MEMBERSHIP_CENTS)
                )}
              </p>
              <ul className="ae-membership-plan__features">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <p className="ae-membership-plan__total">
                Mokate dabar: <strong>{formatPrice(planTotal)}</strong>
                {plan.id === "premium" ? (
                  <span className="ae-membership-plan__price-sub">
                    {" "}
                    · vėliau {premiumRenewalLabel(premiumBilling)}
                  </span>
                ) : null}
              </p>
            </label>
          );
        })}
      </div>

      {planId === "premium" && (
        <fieldset className="ae-membership-billing">
          <legend>Premium prenumeratos laikotarpis</legend>
          <label className="ae-membership-billing__option">
            <input
              type="radio"
              name="premium-billing"
              value="yearly"
              checked={premiumBilling === "yearly"}
              onChange={() => onBillingChange("yearly")}
            />
            <span>
              <strong>{formatPremiumPrice(PREMIUM_YEARLY_CENTS)}/metus</strong>
              <span className="ae-membership-billing__badge">Rekomenduojama</span>
              <span className="ae-membership-plan__price-sub">Pirmas mokėjimas dabar: {formatPremiumPrice(PREMIUM_YEARLY_CENTS)}</span>
            </span>
          </label>
          <label className="ae-membership-billing__option">
            <input
              type="radio"
              name="premium-billing"
              value="monthly"
              checked={premiumBilling === "monthly"}
              onChange={() => onBillingChange("monthly")}
            />
            <span>
              <strong>{formatPremiumPrice(PREMIUM_MONTHLY_CENTS)}/mėn.</strong>
              <span className="ae-membership-plan__price-sub">Pirmas mokėjimas dabar: {formatPremiumPrice(PREMIUM_MONTHLY_CENTS)}</span>
            </span>
          </label>
        </fieldset>
      )}

      <p className="ae-membership-plans__parish-donation">
        {totalCents > 0 ? parishDonationNoteWithAmount(totalCents, parishTitle) : PARISH_DONATION_NOTE}
      </p>

      <p className="ae-membership-plans__retention">{PREMIUM_RETENTION_NOTE}</p>

      <p className="ae-membership-plans__summary">
        Pasirinktas planas: <strong>{getMembershipPlan(planId).name}</strong>
        {planId === "premium" ? ` · ${premiumRenewalLabel(premiumBilling)}` : ""}
        {plateAddOnCents > 0 ? ` · plokštelė ${formatPrice(plateAddOnCents)}` : ""} ·{" "}
        <strong>{formatPrice(totalCents)}</strong>
      </p>
    </div>
  );
}
