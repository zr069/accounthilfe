import { differenceInDays, addDays } from "date-fns";

export type TrackResult = {
  track: "A_INJUNCTION" | "B_LAWSUIT";
  tageHer: number;
  fristTyp: "standard" | "frankfurt_hamburg" | "klage";
  warnung?: string;
};

export type FristResult = {
  fristTage: number;
  fristDatum: Date;
  monatsfristEnde: Date;
  verbleibendeZeit: number;
  track: TrackResult;
};

/**
 * Berechnet den Track (A = eV möglich, B = nur Klage) basierend auf dem Sperrdatum.
 *
 * REGEL: Einstweilige Verfügung nur möglich innerhalb von 30 Tagen (standard)
 * bzw. 35 Tagen (LG Frankfurt / LG Hamburg) nach Kenntnis der Sperrung.
 */
export function berechneTrack(sperrDatum: Date, heute: Date = new Date()): TrackResult {
  const tageHer = differenceInDays(heute, sperrDatum);

  if (tageHer <= 30) {
    return { track: "A_INJUNCTION", tageHer, fristTyp: "standard" };
  }
  if (tageHer <= 35) {
    return {
      track: "A_INJUNCTION",
      tageHer,
      fristTyp: "frankfurt_hamburg",
      warnung:
        "Einstweilige Verfügung nur bei LG Frankfurt/Hamburg noch möglich (5-Wochen-Frist). Zeit ist sehr knapp.",
    };
  }
  return { track: "B_LAWSUIT", tageHer, fristTyp: "klage" };
}

/**
 * Berechnet die optimale Abmahnfrist.
 *
 * Bei Track A: Frist muss kurz genug sein, damit nach Ablauf noch Zeit für eV-Antrag.
 * Bei Track B: Standard 14 Tage (kein Zeitdruck mehr).
 */
export function berechneFrist(sperrDatum: Date, heute: Date = new Date()): FristResult {
  const track = berechneTrack(sperrDatum, heute);

  if (track.track === "B_LAWSUIT") {
    const fristTage = 14;
    return {
      fristTage,
      fristDatum: addDays(heute, fristTage),
      monatsfristEnde: addDays(sperrDatum, 30),
      verbleibendeZeit: 0,
      track,
    };
  }

  // Track A: Frist dynamisch berechnen
  const monatsfristEnde = addDays(sperrDatum, track.fristTyp === "frankfurt_hamburg" ? 35 : 30);
  const verbleibendeZeit = differenceInDays(monatsfristEnde, heute);

  let fristTage: number;
  if (verbleibendeZeit > 21) {
    fristTage = 14;
  } else if (verbleibendeZeit > 14) {
    fristTage = 7;
  } else if (verbleibendeZeit > 7) {
    fristTage = 5;
  } else {
    fristTage = 3;
  }

  // Sicherheitscheck: Fristende darf nicht nach Monatsfristende liegen
  const fristDatum = addDays(heute, fristTage);
  if (differenceInDays(monatsfristEnde, fristDatum) < 5) {
    track.warnung =
      (track.warnung || "") +
      " Die eV-Frist ist sehr knapp. Ggf. direkter eV-Antrag ohne Abmahnung nötig.";
  }

  return { fristTage, fristDatum, monatsfristEnde, verbleibendeZeit, track };
}
