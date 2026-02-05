import type { PlatformKey } from "@/lib/platforms";

export type WizardFormData = {
  // Step 1: Vorprüfung
  wohnsitzDE: boolean | null;
  sperrDatum: string;

  // Step 2: Falldaten
  platform: PlatformKey | null;
  nutzername: string;
  registrierteEmail: string;
  sperrGrund: string;
  sperrGrundFreitext: string;
  sperrDetails: string;

  // Step 3: Kontotyp
  kontotyp: "PRIVAT" | "GEWERBLICH" | null;
  gewerbBeschreibung: string;
  followerCount: string;
  monatlicheEinnahmen: string;
  vertraegeBetroffen: boolean;

  // Step 4: Persönliche Daten
  vorname: string;
  nachname: string;
  strasse: string;
  plz: string;
  stadt: string;
  email: string;
  telefon: string;

  // Step 5: Mandatierung
  vollmacht: boolean;
  verguetung: boolean;
  datenschutz: boolean;
};

export type SperrGrundOption = {
  id: string;
  label: string;
  value: string;
};

export const SPERR_GRUENDE: SperrGrundOption[] = [
  { id: "community", label: "Verstoß gegen Gemeinschaftsstandards", value: "COMMUNITY_STANDARDS" },
  { id: "impersonation", label: "Impersonation / Nachahmung", value: "IMPERSONATION" },
  { id: "spam", label: "Spam / Verdächtiges Verhalten", value: "SPAM" },
  { id: "copyright", label: "Urheberrechtsverstoß", value: "COPYRIGHT" },
  { id: "hate", label: "Hassrede / Diskriminierung", value: "HATE_SPEECH" },
  { id: "unknown", label: "Kein Grund angegeben", value: "UNKNOWN" },
  { id: "other", label: "Sonstiger Grund", value: "OTHER" },
];

export const WIZARD_STEPS = [
  { id: 1, label: "Vorprüfung" },
  { id: 2, label: "Falldaten" },
  { id: 3, label: "Kontotyp" },
  { id: 4, label: "Ihre Daten" },
  { id: 5, label: "Mandatierung" },
] as const;

// Note: generateCaseNumber is now async and imported from @/lib/invoice
// Use generateSequentialNumber() instead for AH-YYYY-NNNN format
