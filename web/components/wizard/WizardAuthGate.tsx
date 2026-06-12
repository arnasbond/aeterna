"use client";

import Link from "next/link";

type Props = {
  returnPath: string;
  fromCandle?: boolean;
};

export function WizardAuthGate({ returnPath, fromCandle }: Props) {
  const registerHref = `/prisijungti?tab=register&next=${encodeURIComponent(returnPath)}`;
  const loginHref = `/prisijungti?tab=login&next=${encodeURIComponent(returnPath)}`;

  return (
    <div className="ae-wizard-auth-gate">
      <span className="ae-wizard-auth-gate__step">1 žingsnis</span>
      <h2 className="ae-wizard-auth-gate__title">Pirmiausia — jūsų paskyra</h2>
      <p className="ae-wizard-auth-gate__lead">
        Memorialą kuriate <strong>mirusiam artimajam</strong>, o paskyra — <strong>jums</strong> (šeimos
        administratoriui). Pirmiausia užsiregistruokite arba prisijunkite savo vardu ir el. paštu. Tik po to
        vedlio kituose žingsniuose įrašysite <strong>velionio</strong> vardą, datas ir nuotraukas.
      </p>
      {fromCandle && (
        <p className="ae-hint ae-wizard-auth-gate__hint">
          Uždegėte žvakutę neegzistuojančiam memorialui — po registracijos ir apmokėjimo galėsite tęsti žvakutės
          uždegimą.
        </p>
      )}
      <ol className="ae-wizard-auth-gate__list">
        <li>
          <strong>Jūs</strong> — registracija / prisijungimas (šeimos administratorius)
        </li>
        <li>
          <strong>Velionis</strong> — memorialo duomenys, nuotraukos, parapija
        </li>
        <li>
          <strong>Apmokėjimas</strong> — skaitmeninė narystė (39 €)
        </li>
      </ol>
      <div className="ae-wizard-auth-gate__actions">
        <Link href={registerHref} className="ae-btn ae-btn--primary ae-btn--wide">
          Registruotis ir tęsti
        </Link>
        <Link href={loginHref} className="ae-btn ae-btn--outline ae-btn--wide">
          Jau turiu paskyrą — prisijungti
        </Link>
      </div>
    </div>
  );
}
