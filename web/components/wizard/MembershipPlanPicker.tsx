"use client";

import {
  BASE_MEMBERSHIP_CENTS,
  formatPremiumPrice,
  getMembershipPlan,
  MEMBERSHIP_PLANS,
  membershipTotalCents,
  PREMIUM_MONTHLY_CENTS,
  PREMIUM_RETENTION_NOTE,
  premiumAddonLabel,
  type MembershipPlanId,
} from "@/lib/premium";
import { formatPrice } from "@/lib/qr-plates";

type Props = {
  planId: MembershipPlanId;
  plateAddOnCents?: number;
  onPlanChange: (planId: MembershipPlanId) => void;
};

export function MembershipPlanPicker({ planId, plateAddOnCents = 0, onPlanChange }: Props) {
  const totalCents = membershipTotalCents(planId, plateAddOnCents);

  return (
    <div className="ae-membership-plans">
      <p className="ae-membership-plans__lead">
        Pasirinkite planą. Premium — tik <strong>{premiumAddonLabel()}</strong> prenumerata (papildomos galimybės).
      </p>
      <div className="ae-membership-plans__grid" role="radiogroup" aria-label="Narystės planai">
        {MEMBERSHIP_PLANS.map((plan) => {
          const selected = planId === plan.id;
          const planTotal =
            plan.id === "premium"
              ? membershipTotalCents("premium", 0)
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
                    {formatPrice(BASE_MEMBERSHIP_CENTS)} + {premiumAddonLabel()}
                    <span className="ae-membership-plan__price-sub"> (pirmas mėnuo dabar)</span>
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
                    · vėliau {formatPremiumPrice(PREMIUM_MONTHLY_CENTS)}/mėn.
                  </span>
                ) : null}
              </p>
            </label>
          );
        })}
      </div>

      <p className="ae-membership-plans__retention">{PREMIUM_RETENTION_NOTE}</p>

      <p className="ae-membership-plans__summary">
        Pasirinktas planas: <strong>{getMembershipPlan(planId).name}</strong>
        {plateAddOnCents > 0 ? ` · plokštelė ${formatPrice(plateAddOnCents)}` : ""} ·{" "}
        <strong>{formatPrice(totalCents)}</strong>
        {planId === "premium" ? ` + ${premiumAddonLabel()} toliau` : ""}
      </p>
    </div>
  );
}
