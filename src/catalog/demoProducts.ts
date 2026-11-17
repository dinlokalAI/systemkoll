import type { Product } from "../domain/types";

// Tydligt syntetisk testkatalog. Inte Systembolagets sortiment eller aktuella priser.
export const demoProducts: Product[] = [
  {
    id: "demo-lager-33",
    name: "Exempel Lager 33 cl",
    category: "beer",
    packageType: "can33",
    volumeMl: 330,
    alcoholPercent: 5.0,
    priceCents: 1590,
    depositCents: 100,
    description: "Påhittad testprodukt – används bara för att prova kalkylen."
  },
  {
    id: "demo-lager-50",
    name: "Exempel Lager 50 cl",
    category: "beer",
    packageType: "can50",
    volumeMl: 500,
    alcoholPercent: 5.2,
    priceCents: 2190,
    depositCents: 100,
    description: "Påhittad testprodukt – används bara för att prova kalkylen."
  },
  {
    id: "demo-strong-50",
    name: "Exempel Starköl 50 cl",
    category: "beer",
    packageType: "can50",
    volumeMl: 500,
    alcoholPercent: 7.2,
    priceCents: 2690,
    depositCents: 100,
    description: "Påhittad testprodukt – används bara för att prova kalkylen."
  },
  {
    id: "demo-cider-33",
    name: "Exempel Cider 33 cl",
    category: "cider",
    packageType: "can33",
    volumeMl: 330,
    alcoholPercent: 4.5,
    priceCents: 1790,
    depositCents: 100,
    description: "Påhittad testprodukt – används bara för att prova kalkylen."
  },
  {
    id: "demo-cider-50",
    name: "Exempel Cider 50 cl",
    category: "cider",
    packageType: "can50",
    volumeMl: 500,
    alcoholPercent: 7.0,
    priceCents: 2490,
    depositCents: 100,
    description: "Påhittad testprodukt – används bara för att prova kalkylen."
  }
];
