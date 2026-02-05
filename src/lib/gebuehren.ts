// Gebühren nach RVG 2025 (KostBRÄG, ab 1.6.2025)
export const GEBUEHREN = {
  PRIVAT: {
    streitwert: 5000,
    geschaeftsgebuehr: 460.85,  // 1,3 Geschäftsgebühr Nr. 2300, 1008 VV RVG
    auslagen: 20.00,            // Nr. 7001, 7002 VV RVG
    ust: 91.36,                 // 19% USt. Nr. 7008 VV RVG
    gesamt: 572.21,
  },
  GEWERBLICH: {
    streitwert: 10000,
    geschaeftsgebuehr: 847.60,  // 1,3 Geschäftsgebühr Nr. 2300, 1008 VV RVG
    auslagen: 20.00,            // Nr. 7001, 7002 VV RVG
    ust: 164.84,                // 19% USt. Nr. 7008 VV RVG
    gesamt: 1032.44,
  },
} as const;

export type Kontotyp = keyof typeof GEBUEHREN;

export const formatCurrency = (amount: number) =>
  amount.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
