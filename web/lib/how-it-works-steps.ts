export type HowItWorksStep = {
  id: number;
  title: string;
  text: string;
  detail: string;
  image: string;
  imageAlt: string;
  screen: "scan" | "profile" | "together";
};

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    id: 1,
    title: "Nuskenuokite QR kodą",
    text: "Kapinėse ar namuose — nuskenuokite QR arba atidarykite nuorodą telefone.",
    detail:
      "Ant paminklo ar plokštelės įtvirtintas QR kodas — tyliai kviečia prisiminti. Nereikia programėlės: užtenka telefono kameros. Nuorodą galite atidaryti ir iš namų, kai norite sugrįžti prie atminties.",
    image: "/images/how-it-works/how-step-1-scan.png",
    imageAlt: "Telefonu skenuojamas QR kodas ant paminklo kapinėse",
    screen: "scan",
  },
  {
    id: 2,
    title: "Atverkite atmintį",
    text: "Viena skaitmeninė erdvė šeimai — nuotraukos, istorija ir kapo vieta žemėlapyje.",
    detail:
      "Atsidaro memorialinis metraštis: portretas, gyvenimo istorija, nuotraukų galerija ir vieta žemėlapyje. Šeima gali redaguoti turinį, o artimieji — saugiai prisiminti bet kada ir bet kur.",
    image: "/images/how-it-works/how-step-2-memory.png",
    imageAlt: "Telefone atvertas skaitmeninis memorialinis puslapis su portretu ir nuotraukomis",
    screen: "profile",
  },
  {
    id: 3,
    title: "Prisiminkite kartu",
    text: "Galerija, video, virtuali žvakutė ir parama pasirinktai parapijai.",
    detail:
      "Uždekite virtualią žvakutę, palikite žodį užuojautos, peržiūrėkite vaizdo įrašą ar giminės medį. Kiekviena auka — ir parama parapijai, kuri rūpinosi jūsų artimuoju.",
    image: "/images/how-it-works/how-step-3-together.png",
    imageAlt: "Šeima kartu prisimena — telefone žvakutė ir nuotraukos",
    screen: "together",
  },
];
