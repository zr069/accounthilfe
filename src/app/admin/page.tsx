"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PLATFORM_CONFIG } from "@/lib/platforms";
import DevoryCredit from "@/components/DevoryCredit";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const STATUS_LABELS: Record<string, string> = {
  MANDAT_ERTEILT: "Mandat erteilt",
  ABMAHNUNG_VERSANDT: "Abmahnung versandt",
  AUSSERGERICHTLICH_ENTSPERRT: "Außergerichtlich entsperrt",
  FRIST_VERSTRICHEN: "Frist verstrichen",
  GERICHTSPROZESS_EINGELEITET: "Gerichtsprozess",
  TERMIN_ANGESETZT: "Termin angesetzt",
  GERICHTLICH_ENTSPERRT: "Gerichtlich entsperrt",
  ABGESCHLOSSEN: "Abgeschlossen",
};

function statusBadgeClass(status: string): string {
  switch (status) {
    case "AUSSERGERICHTLICH_ENTSPERRT":
    case "GERICHTLICH_ENTSPERRT":
      return "bg-green-light text-green";
    case "FRIST_VERSTRICHEN":
    case "GERICHTSPROZESS_EINGELEITET":
      return "bg-accent-light text-accent";
    case "ABGESCHLOSSEN":
      return "bg-subtle text-muted";
    default:
      return "bg-subtle text-foreground";
  }
}

interface CaseRow {
  id: string;
  caseNumber: string;
  status: string;
  track: string;
  platform: keyof typeof PLATFORM_CONFIG;
  nutzername: string;
  abmahnfristDatum: string;
  createdAt: string;
  paymentStatus: "AUSSTEHEND" | "BEZAHLT";
  paymentMethod: "STRIPE" | "PAYPAL" | "UEBERWEISUNG" | null;
  user: {
    vorname: string;
    nachname: string;
  };
}

export default function AdminPage() {
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cases")
      .then((res) => res.json())
      .then((data) => {
        setCases(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const fmtDate = (d: string) =>
    format(new Date(d), "dd.MM.yyyy", { locale: de });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted">Lade Fälle...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 bg-background/92 backdrop-blur-md border-b border-border">
        <div className="max-w-[1200px] mx-auto px-6 py-3.5 flex justify-between items-center">
          <Link href="/admin" className="flex items-center gap-2.5 no-underline">
            <div className="w-8 h-8 rounded-md bg-accent text-white flex items-center justify-center font-serif text-base font-bold">
              §
            </div>
            <span className="font-serif text-[17px] font-bold text-foreground">
              AccountHilfe.de Admin
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted bg-subtle px-3 py-1.5 rounded-md">
              {cases.length} Fälle
            </span>
            <Link
              href="/"
              className="btn-shine bg-accent text-white text-[15px] font-semibold px-7 py-3 rounded-lg no-underline"
            >
              ← Zurück
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-[1200px] mx-auto px-6 pt-6 pb-20">
        <h1 className="font-serif text-2xl font-bold mb-6">Alle Fälle</h1>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-subtle">
                  <th className="text-left px-4 py-3 font-semibold text-muted">Fallnummer</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted">Mandant</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted">Plattform</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted">Nutzername</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted">Eingang</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted">Zahlung</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted">Track</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c) => {
                  const isTrackA = c.track === "A_INJUNCTION";
                  return (
                    <tr
                      key={c.id}
                      className={`border-b border-border-light hover:bg-subtle/50 transition-colors cursor-pointer ${
                        isTrackA ? "border-l-[3px] border-l-accent" : ""
                      }`}
                      onClick={() => window.location.href = `/admin/fall/${c.id}`}
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/fall/${c.id}`}
                          className="text-accent font-semibold no-underline hover:underline"
                        >
                          {c.caseNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        {c.user.vorname} {c.user.nachname}
                      </td>
                      <td className="px-4 py-3">
                        {PLATFORM_CONFIG[c.platform]?.name ?? c.platform}
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {c.nutzername}
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {fmtDate(c.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                          c.paymentStatus === "BEZAHLT"
                            ? "bg-green-light text-green"
                            : "bg-accent-light text-accent"
                        }`}>
                          {c.paymentStatus === "BEZAHLT" ? "Bezahlt" : "Ausstehend"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${statusBadgeClass(c.status)}`}>
                          {STATUS_LABELS[c.status] ?? c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                          isTrackA
                            ? "bg-accent-light text-accent"
                            : "bg-subtle text-muted"
                        }`}>
                          {isTrackA ? "A (eV)" : "B (Klage)"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {cases.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-muted">
                      Keine Fälle vorhanden.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <DevoryCredit />
      </div>
    </div>
  );
}
