"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Timeline, { type TimelineStep } from "@/components/Timeline";
import { PLATFORM_CONFIG, type PlatformKey } from "@/lib/platforms";
import DevoryCredit from "@/components/DevoryCredit";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface CaseData {
  id: string;
  caseNumber: string;
  status: string;
  track: string;
  platform: PlatformKey;
  nutzername: string;
  kontotyp: string;
  abmahnfristDatum: string;
  abmahnfristTage: number;
  createdAt: string;
  user: {
    vorname: string;
    nachname: string;
  };
}

export default function FallPage() {
  const params = useParams();
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/cases/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setCaseData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted">Lade Falldaten...</p>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-accent">Fall nicht gefunden</p>
      </div>
    );
  }

  const pl = PLATFORM_CONFIG[caseData.platform];
  const fristDatum = new Date(caseData.abmahnfristDatum);
  const fmtDate = (d: string) =>
    format(new Date(d), "dd.MM.yyyy", { locale: de });
  const fmtDateLong = (d: string) =>
    format(new Date(d), "EEEE, d. MMMM yyyy", { locale: de });

  const isTrackA = caseData.track === "A_INJUNCTION";

  const timelineSteps: TimelineStep[] = [
    {
      label: "Abmahnung erstellt",
      date: fmtDate(caseData.createdAt),
      status: "done",
    },
    {
      label: `Frist läuft (${caseData.abmahnfristTage} Tage)`,
      date: `bis ${fmtDate(caseData.abmahnfristDatum)}`,
      status: caseData.status === "AUSSERGERICHTLICH_ENTSPERRT" || caseData.status === "GERICHTLICH_ENTSPERRT" || caseData.status === "ABGESCHLOSSEN" ? "done" : "active",
    },
    {
      label: isTrackA ? "Einstweilige Verfügung" : "Klageschrift",
      date: "bei Fristablauf",
      status: "pending",
      subtext:
        isTrackA && caseData.kontotyp === "GEWERBLICH"
          ? "Gewerblich → starker Verfügungsgrund"
          : undefined,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-background/92 backdrop-blur-md border-b border-border">
        <div className="max-w-[960px] mx-auto px-6 py-3.5 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-8 h-8 rounded-md bg-accent text-white flex items-center justify-center font-serif text-base font-bold">
              §
            </div>
            <span className="font-serif text-[17px] font-bold text-foreground">
              AccountHilfe.de
            </span>
          </Link>
          <Link
            href="/"
            className="btn-shine bg-accent text-white text-[15px] font-semibold px-7 py-3 rounded-lg no-underline"
          >
            ← Zurück
          </Link>
        </div>
      </nav>

      <div className="max-w-[680px] mx-auto px-6 pt-8 pb-20">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-green-light flex items-center justify-center mx-auto mb-4 text-2xl">
            ✓
          </div>
          <h1 className="font-serif text-[28px] font-bold mb-1.5">
            Abmahnung erstellt
          </h1>
          <p className="text-[15px] text-muted">
            Fallnummer:{" "}
            <strong className="text-accent">{caseData.caseNumber}</strong>
          </p>
        </div>

        {/* Letter Card */}
        <div className="bg-card border border-border rounded-xl p-7 mb-4">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-serif text-lg font-bold">
              Anwaltliches Schreiben
            </h3>
            <span className="text-xs font-semibold text-green bg-green-light px-2.5 py-1 rounded">
              Erstellt
            </span>
          </div>
          <p className="text-sm text-muted leading-relaxed mb-4">
            Abmahnung an{" "}
            <strong className="text-foreground">{pl.antragsgegner}</strong>.
            Frist:{" "}
            <strong className="text-accent">
              {caseData.abmahnfristTage} Tage
            </strong>
            .
          </p>
          <div className="bg-subtle rounded-lg px-4 py-3 mb-4">
            <div className="flex justify-between py-2.5 border-b border-border-light">
              <span className="text-sm text-muted">Frist bis</span>
              <span className="text-sm font-semibold text-accent text-right">
                {fmtDateLong(caseData.abmahnfristDatum)}
              </span>
            </div>
            <div className="flex justify-between py-2.5 border-b border-border-light">
              <span className="text-sm text-muted">Adressat</span>
              <span className="text-sm font-semibold text-right">
                {pl.antragsgegner}
              </span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-sm text-muted">Verfahren</span>
              <span className="text-sm font-semibold text-right">
                {isTrackA
                  ? "Track A: Abmahnung → eV"
                  : "Track B: Abmahnung → Klage"}
              </span>
            </div>
          </div>
          <Link
            href={`/fall/${caseData.id}/abmahnung`}
            className="btn-shine block bg-accent text-white text-[15px] font-semibold py-3 rounded-lg text-center no-underline"
          >
            Abmahnung ansehen →
          </Link>
        </div>

        {/* Timeline Card */}
        <div className="bg-card border border-border rounded-xl p-7 mb-4">
          <h3 className="font-serif text-lg font-bold mb-5">
            Verfahrensablauf
          </h3>
          <Timeline steps={timelineSteps} />
        </div>

        {(caseData.status === "AUSSERGERICHTLICH_ENTSPERRT" || caseData.status === "GERICHTLICH_ENTSPERRT") && (
          <div className="bg-green-light border border-green/20 rounded-xl p-7 text-center">
            <p className="text-green font-semibold">
              Konto erfolgreich entsperrt
            </p>
          </div>
        )}
        <DevoryCredit />
      </div>
    </div>
  );
}
