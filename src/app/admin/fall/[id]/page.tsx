"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PLATFORM_CONFIG, type PlatformKey } from "@/lib/platforms";
import DevoryCredit from "@/components/DevoryCredit";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const CASE_STATUSES = [
  { value: "MANDAT_ERTEILT", label: "Mandat erteilt" },
  { value: "ABMAHNUNG_VERSANDT", label: "Abmahnung versandt" },
  { value: "AUSSERGERICHTLICH_ENTSPERRT", label: "Außergerichtlich entsperrt" },
  { value: "FRIST_VERSTRICHEN", label: "Frist verstrichen" },
  { value: "GERICHTSPROZESS_EINGELEITET", label: "Gerichtsprozess eingeleitet" },
  { value: "TERMIN_ANGESETZT", label: "Termin angesetzt" },
  { value: "GERICHTLICH_ENTSPERRT", label: "Gerichtlich entsperrt" },
  { value: "ABGESCHLOSSEN", label: "Abgeschlossen" },
] as const;

const SPERR_GRUND_LABELS: Record<string, string> = {
  COMMUNITY_STANDARDS: "Verstoß gegen Gemeinschaftsstandards",
  IMPERSONATION: "Impersonation / Nachahmung",
  SPAM: "Spam / Verdächtiges Verhalten",
  COPYRIGHT: "Urheberrechtsverstoß",
  HATE_SPEECH: "Hassrede / Diskriminierung",
  UNKNOWN: "Kein Grund angegeben",
  OTHER: "Sonstiger Grund",
};

interface UploadData {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
}

interface CaseDetail {
  id: string;
  caseNumber: string;
  status: string;
  track: string;
  platform: PlatformKey;
  nutzername: string;
  registrierteEmail: string;
  kontotyp: string;
  sperrDatum: string;
  sperrGrund: string;
  sperrGrundFreitext: string | null;
  sperrDetails: string | null;
  gewerbBeschreibung: string | null;
  followerCount: string | null;
  monatlicheEinnahmen: string | null;
  vertraegeBetroffen: boolean;
  abmahnfristDatum: string;
  abmahnfristTage: number;
  monatsfristEnde: string;
  vollmachtErteilt: boolean;
  verguetungAkzeptiert: boolean;
  datenschutzAkzeptiert: boolean;
  entsperrtAm: string | null;
  interneNotizen: string | null;
  paymentStatus: "AUSSTEHEND" | "BEZAHLT";
  paymentMethod: "STRIPE" | "PAYPAL" | "UEBERWEISUNG" | null;
  createdAt: string;
  uploads: UploadData[];
  user: {
    vorname: string;
    nachname: string;
    email: string;
    telefon: string | null;
    strasse: string;
    plz: string;
    stadt: string;
  };
}

export default function AdminFallDetailPage() {
  const params = useParams();
  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState("");
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [notizen, setNotizen] = useState("");
  const [notizenSaving, setNotizenSaving] = useState(false);
  const [notizenMsg, setNotizenMsg] = useState("");
  const [paymentConfirming, setPaymentConfirming] = useState(false);
  const [paymentMsg, setPaymentMsg] = useState("");

  useEffect(() => {
    fetch(`/api/cases/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setCaseData(data);
        setNewStatus(data.status);
        setNotizen(data.interneNotizen ?? "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  const changeStatus = async () => {
    if (!newStatus || newStatus === caseData?.status) return;
    setStatusSaving(true);
    setStatusMsg("");

    try {
      const res = await fetch(`/api/admin/cases/${params.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const updated = await res.json();
        setCaseData(updated);
        setStatusMsg("Status aktualisiert");
      } else {
        const errBody = await res.json().catch(() => null);
        const detail = errBody?.details || errBody?.error || res.statusText;
        setStatusMsg(`Fehler (${res.status}): ${detail}`);
      }
    } catch {
      setStatusMsg("Verbindungsfehler");
    } finally {
      setStatusSaving(false);
    }
  };

  const saveNotizen = async () => {
    setNotizenSaving(true);
    setNotizenMsg("");

    try {
      const res = await fetch(`/api/admin/cases/${params.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interneNotizen: notizen }),
      });

      if (res.ok) {
        const updated = await res.json();
        setCaseData(updated);
        setNotizenMsg("Notizen gespeichert");
      } else {
        const errBody = await res.json().catch(() => null);
        const detail = errBody?.details || errBody?.error || res.statusText;
        setNotizenMsg(`Fehler (${res.status}): ${detail}`);
      }
    } catch {
      setNotizenMsg("Verbindungsfehler");
    } finally {
      setNotizenSaving(false);
    }
  };

  const confirmPayment = async () => {
    setPaymentConfirming(true);
    setPaymentMsg("");

    try {
      const res = await fetch(`/api/admin/cases/${params.id}/confirm-payment`, {
        method: "POST",
      });

      if (res.ok) {
        const updated = await res.json();
        setCaseData(updated);
        setPaymentMsg("Zahlung bestätigt");
      } else {
        const errBody = await res.json().catch(() => null);
        const detail = errBody?.error || res.statusText;
        setPaymentMsg(`Fehler: ${detail}`);
      }
    } catch {
      setPaymentMsg("Verbindungsfehler");
    } finally {
      setPaymentConfirming(false);
    }
  };

  const fmtDate = (d: string) =>
    format(new Date(d), "dd.MM.yyyy", { locale: de });

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
  };

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
          <Link
            href="/admin"
            className="btn-shine bg-accent text-white text-[15px] font-semibold px-7 py-3 rounded-lg no-underline"
          >
            ← Zurück
          </Link>
        </div>
      </nav>

      <div className="max-w-[900px] mx-auto px-6 pt-6 pb-20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-serif text-2xl font-bold">
              {caseData.caseNumber}
            </h1>
            <p className="text-sm text-muted">
              {caseData.user.vorname} {caseData.user.nachname} &middot;{" "}
              {pl?.name ?? caseData.platform} &middot; @{caseData.nutzername}
            </p>
          </div>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded ${
            caseData.track === "A_INJUNCTION"
              ? "bg-accent-light text-accent"
              : "bg-subtle text-muted"
          }`}>
            {caseData.track === "A_INJUNCTION" ? "Track A (eV)" : "Track B (Klage)"}
          </span>
        </div>

        {/* Status Change */}
        <div className="bg-card border border-border rounded-xl p-6 mb-4">
          <h3 className="font-serif text-lg font-bold mb-4">Status ändern</h3>
          <div className="flex gap-3 items-end flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3.5 py-[11px] rounded-lg border-[1.5px] bg-card text-foreground text-[15px] outline-none border-border focus:border-muted"
              >
                {CASE_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={changeStatus}
              disabled={statusSaving || newStatus === caseData.status}
              className="btn-shine bg-accent text-white text-[15px] font-semibold px-6 py-[11px] rounded-lg disabled:opacity-60"
            >
              Status speichern
            </button>
          </div>
          {statusMsg && (
            <p className="text-sm text-green mt-2">{statusMsg}</p>
          )}
        </div>

        {/* Payment Status */}
        <div className="bg-card border border-border rounded-xl p-6 mb-4">
          <h3 className="font-serif text-lg font-bold mb-4">Zahlungsstatus</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`text-sm font-semibold px-3 py-1.5 rounded ${
                caseData.paymentStatus === "BEZAHLT"
                  ? "bg-green-light text-green"
                  : "bg-accent-light text-accent"
              }`}>
                {caseData.paymentStatus === "BEZAHLT" ? "Bezahlt" : "Ausstehend"}
              </span>
              <span className="text-sm text-muted">
                {caseData.paymentMethod === "STRIPE" && "via Kreditkarte (Stripe)"}
                {caseData.paymentMethod === "PAYPAL" && "via PayPal"}
                {caseData.paymentMethod === "UEBERWEISUNG" && "via Überweisung"}
                {!caseData.paymentMethod && "Keine Zahlungsmethode"}
              </span>
            </div>
            {caseData.paymentStatus === "AUSSTEHEND" && (
              <button
                onClick={confirmPayment}
                disabled={paymentConfirming}
                className="btn-shine bg-green text-white text-[15px] font-semibold px-6 py-[11px] rounded-lg disabled:opacity-60"
              >
                {paymentConfirming ? "Wird bestätigt..." : "Zahlungseingang bestätigen"}
              </button>
            )}
          </div>
          {paymentMsg && (
            <p className={`text-sm mt-2 ${paymentMsg.includes("Fehler") ? "text-accent" : "text-green"}`}>
              {paymentMsg}
            </p>
          )}
        </div>

        {/* PDF Downloads */}
        <div className="bg-card border border-border rounded-xl p-6 mb-4">
          <h3 className="font-serif text-lg font-bold mb-4">PDF herunterladen</h3>
          <div className="flex gap-3">
            <a
              href={`/api/cases/${caseData.id}/pdf`}
              className="btn-shine flex-1 bg-accent text-white text-[15px] font-semibold py-3 rounded-lg text-center no-underline"
            >
              PDF Deutsch herunterladen
            </a>
            <a
              href={`/api/cases/${caseData.id}/pdf?lang=en`}
              className="flex-1 bg-transparent text-foreground text-[15px] font-medium border-[1.5px] border-border py-[11px] rounded-lg text-center hover:border-muted transition-colors no-underline"
            >
              PDF Englisch herunterladen
            </a>
          </div>
        </div>

        {/* Persönliche Daten (Mandant) */}
        <div className="bg-card border border-border rounded-xl p-6 mb-4">
          <h3 className="font-serif text-lg font-bold mb-4">Mandant</h3>
          <div className="bg-subtle rounded-lg px-4 py-3">
            <Row label="Name" value={`${caseData.user.vorname} ${caseData.user.nachname}`} />
            <Row label="E-Mail" value={caseData.user.email} />
            <Row label="Telefon" value={caseData.user.telefon ?? "–"} />
            <Row label="Adresse" value={`${caseData.user.strasse}, ${caseData.user.plz} ${caseData.user.stadt}`} />
            <Row label="Vollmacht" value={caseData.vollmachtErteilt ? "Erteilt" : "Nein"} />
            <Row label="Vergütung" value={caseData.verguetungAkzeptiert ? "Akzeptiert" : "Nein"} />
            <Row label="Datenschutz" value={caseData.datenschutzAkzeptiert ? "Akzeptiert" : "Nein"} last />
          </div>
        </div>

        {/* Plattform & Sperrung */}
        <div className="bg-card border border-border rounded-xl p-6 mb-4">
          <h3 className="font-serif text-lg font-bold mb-4">Plattform & Sperrung</h3>
          <div className="bg-subtle rounded-lg px-4 py-3">
            <Row label="Plattform" value={pl?.name ?? caseData.platform} />
            <Row label="Nutzername" value={caseData.nutzername} />
            <Row label="Registrierte E-Mail" value={caseData.registrierteEmail} />
            <Row label="Sperrdatum" value={fmtDate(caseData.sperrDatum)} />
            <Row label="Sperrgrund" value={SPERR_GRUND_LABELS[caseData.sperrGrund] ?? caseData.sperrGrund} />
            {caseData.sperrGrundFreitext && (
              <Row label="Sperrgrund (Freitext)" value={caseData.sperrGrundFreitext} />
            )}
            {caseData.sperrDetails && (
              <Row label="Schilderung" value={caseData.sperrDetails} />
            )}
            <Row label="Kontotyp" value={caseData.kontotyp === "GEWERBLICH" ? "Gewerblich" : "Privat"} last />
          </div>
        </div>

        {/* Gewerbliche Details */}
        {caseData.kontotyp === "GEWERBLICH" && (
          <div className="bg-card border border-border rounded-xl p-6 mb-4">
            <h3 className="font-serif text-lg font-bold mb-4">Gewerbliche Details</h3>
            <div className="bg-subtle rounded-lg px-4 py-3">
              {caseData.gewerbBeschreibung && (
                <Row label="Geschäftliche Nutzung" value={caseData.gewerbBeschreibung} />
              )}
              {caseData.followerCount && (
                <Row label="Follower" value={caseData.followerCount} />
              )}
              {caseData.monatlicheEinnahmen && (
                <Row label="Monatliche Einnahmen" value={caseData.monatlicheEinnahmen} />
              )}
              <Row
                label="Verträge betroffen"
                value={caseData.vertraegeBetroffen ? "Ja" : "Nein"}
                last
              />
            </div>
          </div>
        )}

        {/* Fristen & Verfahren */}
        <div className="bg-card border border-border rounded-xl p-6 mb-4">
          <h3 className="font-serif text-lg font-bold mb-4">Fristen & Verfahren</h3>
          <div className="bg-subtle rounded-lg px-4 py-3">
            <Row
              label="Track"
              value={
                caseData.track === "A_INJUNCTION"
                  ? "A: Abmahnung → eV"
                  : "B: Abmahnung → Klage"
              }
            />
            <Row label="Abmahnfrist" value={`${caseData.abmahnfristTage} Tage (bis ${fmtDate(caseData.abmahnfristDatum)})`} />
            <Row label="Monatsfrist-Ende" value={fmtDate(caseData.monatsfristEnde)} />
            {caseData.entsperrtAm && (
              <Row label="Entsperrt am" value={fmtDate(caseData.entsperrtAm)} />
            )}
            <Row label="Erstellt am" value={fmtDate(caseData.createdAt)} last />
          </div>
        </div>

        {/* Hochgeladene Dateien */}
        {caseData.uploads && caseData.uploads.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-6 mb-4">
            <h3 className="font-serif text-lg font-bold mb-4">
              Hochgeladene Dateien ({caseData.uploads.length})
            </h3>
            <div className="space-y-2">
              {caseData.uploads.map((upload) => (
                <a
                  key={upload.id}
                  href={upload.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-subtle border border-border rounded-lg px-4 py-3 no-underline hover:border-muted transition-colors"
                >
                  <div className="w-10 h-10 rounded bg-accent-light flex items-center justify-center shrink-0">
                    <span className="text-accent text-xs font-bold">
                      {upload.mimeType.includes("pdf") ? "PDF" : "IMG"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{upload.filename}</p>
                    <p className="text-xs text-faint">{formatFileSize(upload.size)}</p>
                  </div>
                  <span className="text-xs text-muted">Herunterladen →</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Interne Notizen */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-serif text-lg font-bold mb-4">Interne Notizen</h3>
          <textarea
            value={notizen}
            onChange={(e) => setNotizen(e.target.value)}
            placeholder="Interne Anmerkungen zum Fall..."
            className="w-full px-3.5 py-[11px] rounded-lg border-[1.5px] bg-card text-foreground text-[15px] outline-none border-border focus:border-muted min-h-[120px] resize-y leading-relaxed mb-3"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={saveNotizen}
              disabled={notizenSaving}
              className="btn-shine bg-accent text-white text-[15px] font-semibold px-6 py-[11px] rounded-lg disabled:opacity-60"
            >
              {notizenSaving ? "Speichern..." : "Notizen speichern"}
            </button>
            {notizenMsg && (
              <p className="text-sm text-green">{notizenMsg}</p>
            )}
          </div>
        </div>
        <DevoryCredit />
      </div>
    </div>
  );
}

function Row({
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
      <span className="text-sm font-semibold text-right max-w-[60%]">{value}</span>
    </div>
  );
}
