"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PLATFORM_CONFIG, type PlatformKey } from "@/lib/platforms";
import DevoryCredit from "@/components/DevoryCredit";

const SESSION_STORAGE_KEY = "accounthilfe_wizard_form";
const LOCAL_STORAGE_KEY = "accounthilfe_form_backup";

type BankDetails = {
  empfaenger: string;
  bank: string;
  iban: string;
  bic: string;
};

function ZahlungErfolgContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [caseNumber, setCaseNumber] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [formData, setFormData] = useState<Record<string, unknown> | null>(null);
  const [isUeberweisung, setIsUeberweisung] = useState(false);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [amount, setAmount] = useState<number | null>(null);

  useEffect(() => {
    async function processPayment() {
      // Get payment info from URL
      const stripeSessionId = searchParams.get("session_id");
      const isPayPal = searchParams.get("paypal") === "true";
      const paypalToken = searchParams.get("token");
      const isUeberweisungParam = searchParams.get("ueberweisung") === "true";
      const caseNumberParam = searchParams.get("caseNumber");

      // Handle Überweisung (already created via API)
      if (isUeberweisungParam && caseNumberParam) {
        setIsUeberweisung(true);
        setCaseNumber(caseNumberParam);

        // Get form data from sessionStorage (includes bank details)
        const storedData = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (storedData) {
          try {
            const form = JSON.parse(storedData);
            setFormData(form);
            setBankDetails(form.bankDetails);
            setAmount(form.amount);
          } catch {
            // Continue without form data
          }
        }

        setStatus("success");
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        return;
      }

      if (!stripeSessionId && !isPayPal) {
        setErrorMessage("Keine Zahlungsinformationen gefunden.");
        setStatus("error");
        return;
      }

      // Try to get form data from multiple sources
      let form: Record<string, unknown> | null = null;

      // 1. Try sessionStorage first
      const sessionData = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (sessionData) {
        try {
          form = JSON.parse(sessionData);
          console.log("[erfolg] Form data from sessionStorage");
        } catch {
          // Continue to next source
        }
      }

      // 2. Try localStorage as fallback
      if (!form) {
        const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (localData) {
          try {
            form = JSON.parse(localData);
            console.log("[erfolg] Form data from localStorage");
          } catch {
            // Continue to next source
          }
        }
      }

      // 3. Try database as final fallback
      if (!form) {
        try {
          const queryParam = stripeSessionId
            ? `stripeSessionId=${stripeSessionId}`
            : `paypalOrderId=${paypalToken}`;

          const response = await fetch(`/api/pending-submission?${queryParam}`);
          if (response.ok) {
            const data = await response.json();
            form = data.formData;
            console.log("[erfolg] Form data from database");
          }
        } catch (e) {
          console.error("[erfolg] Failed to fetch from DB:", e);
        }
      }

      // If still no form data, show error
      if (!form) {
        setErrorMessage("Formulardaten nicht gefunden. Bitte starten Sie den Vorgang erneut.");
        setStatus("error");
        return;
      }

      setFormData(form);

      // Call API to create case
      try {
        const response = await fetch("/api/cases/create-after-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider: isPayPal ? "paypal" : "stripe",
            stripeSessionId: stripeSessionId || undefined,
            paypalOrderId: paypalToken || undefined,
            ...form,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Fehler beim Erstellen des Falls");
        }

        setCaseNumber(result.caseNumber);
        setStatus("success");

        // Clean up all storage after successful case creation
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        localStorage.removeItem(LOCAL_STORAGE_KEY);

        // Also clean up database entry
        const cleanupParam = stripeSessionId
          ? `stripeSessionId=${stripeSessionId}`
          : `paypalOrderId=${paypalToken}`;
        fetch(`/api/pending-submission?${cleanupParam}`, { method: "DELETE" }).catch(() => {});

      } catch (e) {
        console.error("Error creating case:", e);
        setErrorMessage(e instanceof Error ? e.message : "Unbekannter Fehler");
        setStatus("error");
      }
    }

    processPayment();
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted">Zahlung wird verarbeitet...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-background text-foreground">
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

        <div className="max-w-[640px] mx-auto px-6 pt-16 pb-20">
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-accent-light flex items-center justify-center mx-auto mb-4 text-2xl">
              !
            </div>
            <h1 className="font-serif text-2xl font-bold mb-2">
              Fehler bei der Verarbeitung
            </h1>
            <p className="text-muted mb-6">{errorMessage}</p>
            <Link
              href="/start"
              className="btn-shine inline-block bg-accent text-white text-[15px] font-semibold px-8 py-3.5 rounded-lg no-underline"
            >
              Zurück zum Wizard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  const platformKey = formData?.platform as PlatformKey | undefined;
  const platformName = platformKey ? PLATFORM_CONFIG[platformKey]?.name : "";

  const formatCurrency = (val: number) =>
    val.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

  return (
    <div className="min-h-screen bg-background text-foreground">
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

      <div className="max-w-[640px] mx-auto px-6 pt-8 pb-20">
        <div className="bg-card border border-border rounded-xl p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-green-light flex items-center justify-center mx-auto mb-4 text-2xl">
              ✓
            </div>
            <h1 className="font-serif text-2xl font-bold mb-1.5 tracking-tight">
              {isUeberweisung ? "Auftrag erfasst!" : "Zahlung erfolgreich!"}
            </h1>
            <p className="text-[15px] text-muted leading-relaxed">
              Ihr Fall wurde erstellt. Ihre Fallnummer:{" "}
              <strong className="text-accent">{caseNumber}</strong>
            </p>
          </div>

          {formData && (
            <div className="bg-subtle rounded-[10px] p-5 mb-6">
              <SummaryRow
                label="Plattform"
                value={platformName || String(formData.platform)}
              />
              <SummaryRow
                label="Nutzername"
                value={String(formData.nutzername || "")}
              />
              <SummaryRow
                label="Kontotyp"
                value={formData.kontotyp === "GEWERBLICH" ? "Gewerblich" : "Privat"}
              />
              <SummaryRow
                label="Mandant"
                value={`${formData.vorname} ${formData.nachname}`}
                last
              />
            </div>
          )}

          {/* Bank details for Überweisung */}
          {isUeberweisung && bankDetails && amount && (
            <div className="bg-accent-light border border-accent/20 rounded-[10px] p-5 mb-6">
              <p className="text-sm font-semibold text-accent mb-3">
                Bitte überweisen Sie den Rechnungsbetrag:
              </p>
              <p className="text-2xl font-bold text-accent mb-4">
                {formatCurrency(amount)}
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Empfänger:</span>
                  <span className="font-medium">{bankDetails.empfaenger}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Bank:</span>
                  <span className="font-medium">{bankDetails.bank}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">IBAN:</span>
                  <span className="font-mono font-medium">{bankDetails.iban}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">BIC:</span>
                  <span className="font-mono font-medium">{bankDetails.bic}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-accent/20">
                  <span className="text-muted">Verwendungszweck:</span>
                  <span className="font-semibold text-accent">{caseNumber}</span>
                </div>
              </div>
              <p className="text-xs text-muted mt-4">
                <strong>Wichtig:</strong> Bitte geben Sie unbedingt die Fallnummer als Verwendungszweck an.
              </p>
            </div>
          )}

          <div className="p-4 rounded-[10px] border border-green/20 bg-green-light mb-6">
            <p className="text-sm font-semibold mb-1 text-green">
              Was passiert als Nächstes?
            </p>
            <p className="text-sm text-muted leading-relaxed">
              Wir haben Ihnen eine Bestätigung an <strong>{String(formData?.email || "")}</strong> gesendet.
              {isUeberweisung ? (
                <> Nach Zahlungseingang beginnen wir umgehend mit der Bearbeitung Ihres Falls.</>
              ) : (
                <> Ihr anwaltliches Schreiben wird zeitnah an die Plattform versendet.</>
              )}
              {" "}Sie können den Status Ihres Falls jederzeit unter <strong>Mein Fall</strong> abrufen.
            </p>
          </div>

          <Link
            href="/mein-fall"
            className="btn-shine block bg-accent text-white text-[15px] font-semibold py-3 rounded-lg text-center no-underline"
          >
            Fallstatus abfragen →
          </Link>
        </div>
        <DevoryCredit />
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex justify-between py-2.5 ${
        last ? "" : "border-b border-border-light"
      }`}
    >
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm font-semibold text-right">{value}</span>
    </div>
  );
}

export default function ZahlungErfolgPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted">Laden...</p>
          </div>
        </div>
      }
    >
      <ZahlungErfolgContent />
    </Suspense>
  );
}
