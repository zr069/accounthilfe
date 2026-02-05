"use client";

import { useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import DevoryCredit from "@/components/DevoryCredit";
import { PLATFORM_CONFIG } from "@/lib/platforms";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface CaseLookupResult {
  caseNumber: string;
  status: string;
  platform: keyof typeof PLATFORM_CONFIG;
  track: string;
  abmahnfristDatum: string;
  createdAt: string;
  paymentStatus: "AUSSTEHEND" | "BEZAHLT";
  paymentMethod: "STRIPE" | "PAYPAL" | "UEBERWEISUNG" | null;
  kontotyp: "PRIVAT" | "GEWERBLICH";
}

const BANK_DETAILS = {
  empfaenger: "DR. SARAFI Rechtsanwaltsgesellschaft mbH",
  bank: "Frankfurter Sparkasse",
  iban: "DE90 5005 0201 0200 7049 07",
  bic: "HELADEF1822",
};

const GEBUEHREN = {
  PRIVAT: 572.21,
  GEWERBLICH: 1032.44,
};

export default function MeinFallPage() {
  const [email, setEmail] = useState("");
  const [caseNumber, setCaseNumber] = useState("");
  const [result, setResult] = useState<CaseLookupResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch("/api/cases/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, caseNumber }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Fehler bei der Abfrage");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setResult(data);
    } catch {
      setError("Verbindungsfehler. Bitte versuchen Sie es erneut.");
    } finally {
      setLoading(false);
    }
  };

  const fmtDate = (d: string) =>
    format(new Date(d), "dd.MM.yyyy", { locale: de });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />

      <div className="max-w-[640px] mx-auto px-6 pt-8 pb-20">
        <div className="text-center mb-8">
          <h1 className="font-serif text-[28px] font-bold mb-1.5">
            Fallstatus abfragen
          </h1>
          <p className="text-[15px] text-muted leading-relaxed">
            Geben Sie Ihre E-Mail-Adresse und Fallnummer ein, um den aktuellen
            Status Ihres Falls einzusehen.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8">
          <form onSubmit={lookup}>
            <div className="mb-5">
              <label className="block text-sm font-semibold mb-1.5">
                E-Mail-Adresse
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ihre@email.de"
                required
                className="w-full px-3.5 py-[11px] rounded-lg border-[1.5px] bg-card text-foreground text-[15px] outline-none transition-colors border-border focus:border-muted"
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold mb-1.5">
                Fallnummer
              </label>
              <input
                type="text"
                value={caseNumber}
                onChange={(e) => setCaseNumber(e.target.value)}
                placeholder="AH-2026-0001"
                required
                className="w-full px-3.5 py-[11px] rounded-lg border-[1.5px] bg-card text-foreground text-[15px] outline-none transition-colors border-border focus:border-muted"
              />
            </div>

            {error && (
              <div className="p-3.5 rounded-[10px] border border-accent/20 bg-accent-light mb-5">
                <p className="text-sm text-accent">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-shine w-full bg-accent text-white text-[15px] font-semibold py-3 rounded-lg disabled:opacity-60"
            >
              {loading ? "Wird abgefragt..." : "Status abfragen"}
            </button>
          </form>
        </div>

        {result && (
          <div className="bg-card border border-border rounded-xl p-7 mt-4">
            <div className="flex justify-between items-start mb-5">
              <h3 className="font-serif text-lg font-bold">
                Fall {result.caseNumber}
              </h3>
              <span className="text-xs font-semibold text-green bg-green-light px-2.5 py-1 rounded">
                {result.status}
              </span>
            </div>

            {/* Payment pending banner for Überweisung */}
            {result.paymentStatus === "AUSSTEHEND" && result.paymentMethod === "UEBERWEISUNG" && (
              <div className="bg-accent-light border border-accent/20 rounded-lg p-5 mb-5">
                <p className="text-sm font-semibold text-accent mb-3">
                  Zahlung ausstehend – Bitte überweisen Sie:
                </p>
                <p className="text-xl font-bold text-accent mb-3">
                  {GEBUEHREN[result.kontotyp].toLocaleString("de-DE", { minimumFractionDigits: 2 })} €
                </p>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">Empfänger:</span>
                    <span className="font-medium">{BANK_DETAILS.empfaenger}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Bank:</span>
                    <span className="font-medium">{BANK_DETAILS.bank}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">IBAN:</span>
                    <span className="font-mono font-medium">{BANK_DETAILS.iban}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">BIC:</span>
                    <span className="font-mono font-medium">{BANK_DETAILS.bic}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-accent/20">
                    <span className="text-muted">Verwendungszweck:</span>
                    <span className="font-semibold text-accent">{result.caseNumber}</span>
                  </div>
                </div>
                <p className="text-xs text-muted mt-3">
                  Nach Zahlungseingang beginnen wir umgehend mit der Bearbeitung.
                </p>
              </div>
            )}

            <div className="bg-subtle rounded-lg px-4 py-3">
              <div className="flex justify-between py-2.5 border-b border-border-light">
                <span className="text-sm text-muted">Plattform</span>
                <span className="text-sm font-semibold">
                  {PLATFORM_CONFIG[result.platform]?.name ?? result.platform}
                </span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-border-light">
                <span className="text-sm text-muted">Verfahren</span>
                <span className="text-sm font-semibold">
                  {result.track === "A_INJUNCTION"
                    ? "Track A: Abmahnung → eV"
                    : "Track B: Abmahnung → Klage"}
                </span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-border-light">
                <span className="text-sm text-muted">Frist bis</span>
                <span className="text-sm font-semibold text-accent">
                  {fmtDate(result.abmahnfristDatum)}
                </span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-border-light">
                <span className="text-sm text-muted">Zahlung</span>
                <span className={`text-sm font-semibold ${
                  result.paymentStatus === "BEZAHLT" ? "text-green" : "text-accent"
                }`}>
                  {result.paymentStatus === "BEZAHLT" ? "Bezahlt" : "Ausstehend"}
                </span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-sm text-muted">Erstellt am</span>
                <span className="text-sm font-semibold">
                  {fmtDate(result.createdAt)}
                </span>
              </div>
            </div>
          </div>
        )}
        <DevoryCredit />
      </div>
    </div>
  );
}
