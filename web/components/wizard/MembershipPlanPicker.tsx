"use client";

import {
  BASE_MEMBERSHIP_CENTS,
  formatPremiumPrice,
  getMembershipPlan,
  MEMBERSHIP_PLANS,
  membershipTotalCents,
  PREMIUM_MONTHLY_CENTS,
  PREMIUM_YEARLY_CENTS,
  premiumAddonLabel,
  type MembershipPlanId,
  type PremiumPlan,
} from "@/lib/premium";
import { formatPrice } from "@/lib/qr-plates";

type Props = {
  planId: MembershipPlanId;
  premiumBilling: PremiumPlan;
  plateAddOnCents?: number;
  onPlanChange: (planId: MembershipPlanId) => void;
  onPremiumBillingChange: (billing: PremiumPlan) => void;
};

export function MembershipPlanPicker({
  planId,
  premiumBilling,
  plateAddOnCents = 0,
  onPlanChange,
  onPremiumBillingChange,
}: Props) {
  const totalCents = membershipTotalCents(planId, premiumBilling, plateAddOnCents);

  return (
    <div className="ae-membership-plans">
      <p className="ae-membership-plans__lead">Pasirinkite narystės planą šiam memorialui:</p>
      <div className="ae-membership-plans__grid" role="radiogroup" aria-label="Narystės planai">
        {MEMBERSHIP_PLANS.map((plan) => {
          const selected = planId === plan.id;
          const planTotal =
            plan.id === "premium"
              ? membershipTotalCents("premium", premiumBilling, 0)
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
                {plan.id === "premium"
                  ? `${formatPrice(BASE_MEMBERSHIP_CENTS)} + ${premiumAddonLabel(premiumBilling)}`
                  : formatPrice(BASE_MEMBERSHIP_CENTS)}
              </p>
              <ul className="ae-membership-plan__features">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <p className="ae-membership-plan__total">
                Iš viso dabar: <strong>{formatPrice(planTotal)}</strong>
              </p>
            </label>
          );
        })}
      </div>

      {planId === "premium" && (
        <fieldset className="ae-membership-billing">
          <legend>Premium atsiskaitymas</legend>
          <label className="ae-membership-billing__option">
            <input
              type="radio"
              name="premium-billing"
              checked={premiumBilling === "yearly"}
              onChange={() => onPremiumBillingChange("yearly")}
            />
            <span>
              Metinis — {formatPremiumPrice(PREMIUM_YEARLY_CENTS)}/metus{" "}
              <span className="ae-hint">(naudingiausia)</span>
            </span>
          </label>
          <label className="ae-membership-billing__option">
            <input
              type="radio"
              name="premium-billing"
              checked={premiumBilling === "monthly"}
              onChange={() => onPremiumBillingChange("monthly")}
            />
            <span>Mėnesinis — {formatPremiumPrice(PREMIUM_MONTHLY_CENTS)}/mėn.</span>
          </label>
        </fieldset>
      )}

      <p className="ae-membership-plans__summary">
        Pasirinktas planas: <strong>{getMembershipPlan(planId).name}</strong>
        {plateAddOnCents > 0 ? ` · plokštelė ${formatPrice(plateAddOnCents)}` : ""} ·{" "}
        <strong>{formatPrice(totalCents)}</strong>
      </p>
    </div>
  );
}
