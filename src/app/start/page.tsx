"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import WizardProgress from "@/components/WizardProgress";
import PlatformSelector from "@/components/PlatformSelector";
import TrackInfo from "@/components/TrackInfo";
import { berechneTrack } from "@/lib/fristlogik";
import { PLATFORM_CONFIG, type PlatformKey } from "@/lib/platforms";
import { SPERR_GRUENDE, type WizardFormData } from "@/types";
import { GEBUEHREN, formatCurrency } from "@/lib/gebuehren";
import DevoryCredit from "@/components/DevoryCredit";

const SESSION_STORAGE_KEY = "accounthilfe_wizard_form";
const LOCAL_STORAGE_KEY = "accounthilfe_form_backup";

type PaymentProvider = "stripe" | "paypal" | "ueberweisung" | null;

const initialForm: WizardFormData = {
  wohnsitzDE: null,
  sperrDatum: "",
  platform: null,
  nutzername: "",
  registrierteEmail: "",
  sperrGrund: "",
  sperrGrundFreitext: "",
  sperrDetails: "",
  kontotyp: null,
  gewerbBeschreibung: "",
  followerCount: "",
  monatlicheEinnahmen: "",
  vertraegeBetroffen: false,
  vorname: "",
  nachname: "",
  strasse: "",
  plz: "",
  stadt: "",
  email: "",
  telefon: "",
  vollmacht: false,
  verguetung: false,
  datenschutz: false,
};

export default function WizardPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<WizardFormData>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>(null);

  // Email verification state
  const [emailVerified, setEmailVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];
  const ALLOWED_EXT = /\.(jpe?g|png|pdf)$/i;

  const addFiles = useCallback((incoming: File[]) => {
    const valid = incoming.filter(
      (f) => ALLOWED_TYPES.includes(f.type) || ALLOWED_EXT.test(f.name)
    );
    if (valid.length < incoming.length) {
      setErrors((prev) => ({
        ...prev,
        upload: `${incoming.length - valid.length} Datei(en) übersprungen – nur JPG, PNG und PDF erlaubt.`,
      }));
    } else {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.upload;
        return next;
      });
    }
    if (valid.length > 0) {
      setFiles((prev) => [...prev, ...valid]);
    }
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => {
      const file = prev[index];
      if (file.type.startsWith("image/")) {
        URL.revokeObjectURL(URL.createObjectURL(file));
      }
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
  };

  const set = <K extends keyof WizardFormData>(key: K, value: WizardFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
    // Reset email verification if email changes
    if (key === "email" && value !== verifiedEmail) {
      setEmailVerified(false);
      setCodeSent(false);
      setVerificationCode("");
    }
  };

  // Cooldown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Send verification code
  const sendVerificationCode = async () => {
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setErrors((prev) => ({ ...prev, email: "Ungültige E-Mail-Adresse" }));
      return;
    }

    setSendingCode(true);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.email;
      delete next.verificationCode;
      return next;
    });

    try {
      const res = await fetch("/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Fehler beim Senden");
      }

      setCodeSent(true);
      setResendCooldown(60);
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        email: err instanceof Error ? err.message : "Fehler beim Senden des Codes",
      }));
    } finally {
      setSendingCode(false);
    }
  };

  // Verify the entered code
  const verifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setErrors((prev) => ({ ...prev, verificationCode: "Bitte 6-stelligen Code eingeben" }));
      return;
    }

    setVerifyingCode(true);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.verificationCode;
      return next;
    });

    try {
      const res = await fetch("/api/verify-email/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, code: verificationCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ungültiger Code");
      }

      setEmailVerified(true);
      setVerifiedEmail(form.email);
      setErrors((prev) => {
        const next = { ...prev };
        delete next.email;
        return next;
      });
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        verificationCode: err instanceof Error ? err.message : "Ungültiger Code",
      }));
    } finally {
      setVerifyingCode(false);
    }
  };

  const trackInfo = useMemo(
    () => (form.sperrDatum ? berechneTrack(new Date(form.sperrDatum)) : null),
    [form.sperrDatum]
  );

  const validate = (s: number): boolean => {
    const e: Record<string, string> = {};

    if (s === 1) {
      if (form.wohnsitzDE === null) e.wohnsitzDE = "Bitte angeben";
      if (form.wohnsitzDE === false)
        e.wohnsitzDE = "Nur für Mandanten mit Wohnsitz in Deutschland.";
      if (!form.sperrDatum) {
        e.sperrDatum = "Pflichtfeld";
      } else if (new Date(form.sperrDatum) > new Date()) {
        e.sperrDatum = "Das Sperrdatum kann nicht in der Zukunft liegen";
      }
    }

    if (s === 2) {
      if (!form.platform) e.platform = "Bitte wählen";
      if (!form.nutzername.trim()) e.nutzername = "Pflichtfeld";
      if (!form.registrierteEmail.trim()) e.registrierteEmail = "Pflichtfeld";
      if (!form.sperrGrund) e.sperrGrund = "Pflichtfeld";
    }

    if (s === 3) {
      if (form.kontotyp === null) e.kontotyp = "Bitte angeben";
    }

    if (s === 4) {
      if (!form.vorname.trim()) e.vorname = "Pflichtfeld";
      if (!form.nachname.trim()) e.nachname = "Pflichtfeld";
      if (!form.strasse.trim()) e.strasse = "Pflichtfeld";
      if (!form.plz.trim()) e.plz = "Pflichtfeld";
      if (!form.stadt.trim()) e.stadt = "Pflichtfeld";
      if (!form.email.trim()) e.email = "Pflichtfeld";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        e.email = "Ungültige E-Mail";
      else if (!emailVerified || verifiedEmail !== form.email)
        e.email = "E-Mail muss verifiziert werden";
    }

    if (s === 5) {
      if (!form.vollmacht) e.vollmacht = "Pflichtfeld";
      if (!form.verguetung) e.verguetung = "Pflichtfeld";
      if (!form.datenschutz) e.datenschutz = "Pflichtfeld";
      if (!paymentProvider) e.payment = "Bitte Zahlungsmethode wählen";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (validate(step)) setStep((s) => s + 1);
  };

  const prev = () => setStep((s) => Math.max(1, s - 1));

  const submit = async () => {
    if (!validate(5)) return;
    if (!paymentProvider) return;
    setSubmitting(true);

    try {
      // For Überweisung, create case directly without payment redirect
      if (paymentProvider === "ueberweisung") {
        const res = await fetch("/api/cases/create-with-ueberweisung", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Fehler beim Erstellen des Falls");
        }

        const data = await res.json();

        // Store result for success page
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
          ...form,
          caseNumber: data.caseNumber,
          paymentMethod: "UEBERWEISUNG",
          amount: data.amount,
          bankDetails: data.bankDetails,
        }));

        // Redirect to success page with ueberweisung flag
        window.location.href = `/zahlung/erfolg?ueberweisung=true&caseNumber=${data.caseNumber}`;
        return;
      }

      // Save form data to sessionStorage AND localStorage (backup for Safari)
      const formDataStr = JSON.stringify(form);
      sessionStorage.setItem(SESSION_STORAGE_KEY, formDataStr);
      localStorage.setItem(LOCAL_STORAGE_KEY, formDataStr);

      // Create checkout session - also send formData to store in DB
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: paymentProvider,
          kontotyp: form.kontotyp,
          email: form.email,
          formData: form, // Send complete form data for DB storage
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Fehler beim Erstellen der Zahlung");
      }

      const data = await res.json();

      // Redirect to payment provider
      window.location.href = data.url;
    } catch (e) {
      console.error("Checkout error:", e);
      setErrors({ submit: e instanceof Error ? e.message : "Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut." });
      setSubmitting(false);
    }
  };

  const Err = ({ k }: { k: string }) =>
    errors[k] ? <p className="text-accent text-[13px] mt-1">{errors[k]}</p> : null;

  const inputClass = (key: string) =>
    `w-full px-3.5 py-[11px] rounded-lg border-[1.5px] bg-card text-foreground text-[15px] outline-none transition-colors ${
      errors[key] ? "border-accent" : "border-border focus:border-muted"
    }`;

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

      {/* Progress */}
      <div className="max-w-[640px] mx-auto px-6 pt-6">
        <WizardProgress currentStep={step} />
      </div>

      {/* Form */}
      <div className="max-w-[640px] mx-auto px-6 pt-8 pb-20">
        <div className="bg-card border border-border rounded-xl p-8">
          {/* Step 1: Vorprüfung */}
          {step === 1 && (
            <>
              <h2 className="font-serif text-2xl font-bold mb-1.5 tracking-tight">
                Schnelle Vorprüfung
              </h2>
              <p className="text-[15px] text-muted mb-7 leading-relaxed">
                Zwei Fragen, damit wir Ihre Möglichkeiten sofort einschätzen
                können.
              </p>

              <div className="mb-5">
                <label className="block text-sm font-semibold mb-1.5">
                  Haben Sie Ihren Wohnsitz in Deutschland? *
                </label>
                <div className="flex gap-2.5">
                  {[true, false].map((v) => (
                    <button
                      key={String(v)}
                      type="button"
                      onClick={() => set("wohnsitzDE", v)}
                      className={`flex-1 py-[11px] px-6 rounded-lg border-[1.5px] text-[15px] cursor-pointer transition-colors ${
                        form.wohnsitzDE === v
                          ? v
                            ? "bg-green-light border-green text-green font-semibold"
                            : "bg-accent-light border-accent text-accent font-semibold"
                          : "bg-transparent border-border text-foreground"
                      }`}
                    >
                      {v ? "Ja" : "Nein"}
                    </button>
                  ))}
                </div>
                <Err k="wohnsitzDE" />
                {form.wohnsitzDE === false && (
                  <div className="p-3.5 rounded-[10px] border border-accent/20 bg-accent-light mt-5">
                    <p className="text-sm font-semibold mb-1 text-accent">
                      Nicht verfügbar
                    </p>
                    <p className="text-sm text-muted leading-relaxed">
                      Wir können derzeit nur Mandanten mit Wohnsitz in Deutschland vertreten.
                    </p>
                  </div>
                )}
              </div>

              <div className="mb-5">
                <label className={`block text-sm font-semibold mb-1.5 ${form.wohnsitzDE !== true ? "text-faint" : ""}`}>
                  Wann wurde Ihr Konto gesperrt? *
                </label>
                <input
                  ref={dateInputRef}
                  type="date"
                  value={form.sperrDatum}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => set("sperrDatum", e.target.value)}
                  onClick={() => {
                    if (form.wohnsitzDE === true && dateInputRef.current) {
                      if (typeof dateInputRef.current.showPicker === "function") {
                        dateInputRef.current.showPicker();
                      } else {
                        dateInputRef.current.focus();
                      }
                    }
                  }}
                  disabled={form.wohnsitzDE !== true}
                  className={`${inputClass("sperrDatum")} ${form.wohnsitzDE !== true ? "opacity-50 cursor-not-allowed bg-subtle" : "cursor-pointer"}`}
                />
                <Err k="sperrDatum" />
              </div>

              {trackInfo && <TrackInfo track={trackInfo} />}
            </>
          )}

          {/* Step 2: Falldaten */}
          {step === 2 && (
            <>
              <h2 className="font-serif text-2xl font-bold mb-1.5 tracking-tight">
                Angaben zum gesperrten Konto
              </h2>
              <p className="text-[15px] text-muted mb-7 leading-relaxed">
                Diese Daten benötigen wir für das anwaltliche Schreiben.
              </p>

              <div className="mb-5">
                <label className="block text-sm font-semibold mb-1.5">
                  Plattform *
                </label>
                <PlatformSelector
                  value={form.platform}
                  onChange={(p) => set("platform", p)}
                  error={errors.platform}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-sm font-semibold mb-1.5">
                    {form.platform === "WHATSAPP" ? "WhatsApp-Telefonnummer *" : "Nutzername *"}
                  </label>
                  <input
                    type={form.platform === "WHATSAPP" ? "tel" : "text"}
                    value={form.nutzername}
                    onChange={(e) => set("nutzername", e.target.value)}
                    placeholder={form.platform === "WHATSAPP" ? "+49 123 456789" : "@benutzername"}
                    className={inputClass("nutzername")}
                  />
                  <Err k="nutzername" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">
                    {form.platform === "WHATSAPP" ? "Registrierte Telefonnummer *" : "Registrierte E-Mail *"}
                  </label>
                  <input
                    type={form.platform === "WHATSAPP" ? "tel" : "email"}
                    value={form.registrierteEmail}
                    onChange={(e) =>
                      set("registrierteEmail", e.target.value)
                    }
                    placeholder={form.platform === "WHATSAPP" ? "+49 123 456789" : "konto@email.de"}
                    className={inputClass("registrierteEmail")}
                  />
                  <Err k="registrierteEmail" />
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-semibold mb-1.5">
                  Grund der Sperrung *
                </label>
                <select
                  value={form.sperrGrund}
                  onChange={(e) => set("sperrGrund", e.target.value)}
                  className={`${inputClass("sperrGrund")} appearance-none`}
                >
                  <option value="">Bitte wählen…</option>
                  {SPERR_GRUENDE.map((g) => (
                    <option key={g.id} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
                <Err k="sperrGrund" />
              </div>

              {form.sperrGrund === "OTHER" && (
                <div className="mb-5">
                  <label className="block text-sm font-semibold mb-1.5">
                    Sperrgrund (Freitext)
                  </label>
                  <input
                    value={form.sperrGrundFreitext}
                    onChange={(e) =>
                      set("sperrGrundFreitext", e.target.value)
                    }
                    className={inputClass("sperrGrundFreitext")}
                  />
                </div>
              )}

              <div className="mb-5">
                <label className="block text-sm font-semibold mb-1.5">
                  Weitere Details (optional)
                </label>
                <textarea
                  value={form.sperrDetails}
                  onChange={(e) => set("sperrDetails", e.target.value)}
                  placeholder="Was ist passiert? Einspruch eingelegt?"
                  className={`${inputClass("sperrDetails")} min-h-[90px] resize-y leading-relaxed`}
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-semibold mb-1.5">
                  Screenshots / E-Mails hochladen
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.length) {
                      addFiles(Array.from(e.target.files));
                    }
                    e.target.value = "";
                  }}
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragOver(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragOver(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragOver(false);
                    if (e.dataTransfer.files?.length) {
                      addFiles(Array.from(e.dataTransfer.files));
                    }
                  }}
                  className={`border-2 border-dashed rounded-[10px] py-7 px-5 text-center cursor-pointer transition-all ${
                    dragOver
                      ? "border-accent bg-accent-light border-spacing-4"
                      : "border-border bg-subtle hover:border-muted"
                  }`}
                >
                  <div className="text-2xl mb-2 text-faint">
                    {dragOver ? "⬇" : "📎"}
                  </div>
                  <p className="text-sm text-muted">
                    {dragOver
                      ? "Dateien hier ablegen"
                      : "Dateien hierher ziehen oder klicken"}
                  </p>
                  <p className="text-xs text-faint mt-1.5">
                    JPG, PNG, PDF – max. 10 MB
                  </p>
                </div>
                <Err k="upload" />

                {files.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-muted mb-2">
                      {files.length} {files.length === 1 ? "Datei" : "Dateien"} ausgewählt
                    </p>
                    <div className="space-y-2">
                      {files.map((f, i) => (
                        <div
                          key={`${f.name}-${i}`}
                          className="flex items-center gap-3 bg-subtle border border-border rounded-lg px-3 py-2.5"
                        >
                          {f.type.startsWith("image/") ? (
                            <img
                              src={URL.createObjectURL(f)}
                              alt={f.name}
                              className="w-10 h-10 rounded object-cover shrink-0"
                              onLoad={(e) =>
                                URL.revokeObjectURL(
                                  (e.target as HTMLImageElement).src
                                )
                              }
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-accent-light flex items-center justify-center shrink-0">
                              <span className="text-accent text-xs font-bold">
                                PDF
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground truncate">
                              {f.name}
                            </p>
                            <p className="text-xs text-faint">
                              {formatFileSize(f.size)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(i);
                            }}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-muted hover:bg-accent-light hover:text-accent transition-colors shrink-0"
                            title="Entfernen"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Step 3: Kontotyp */}
          {step === 3 && (
            <>
              <h2 className="font-serif text-2xl font-bold mb-1.5 tracking-tight">
                Wie nutzen Sie Ihr Konto?
              </h2>
              <p className="text-[15px] text-muted mb-7 leading-relaxed">
                Die Art der Nutzung bestimmt die rechtliche Strategie –
                insbesondere die Eilbedürftigkeit.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    ["PRIVAT", "Privat", "Persönliche Nutzung, Meinungsäußerung"],
                    ["GEWERBLICH", "Gewerblich", "Influencer, Selbstständige, Unternehmen, Künstler"],
                  ] as const
                ).map(([id, label, desc]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => set("kontotyp", id)}
                    className={`p-6 rounded-[10px] border-[1.5px] cursor-pointer text-left transition-colors ${
                      form.kontotyp === id
                        ? "border-accent bg-accent-light"
                        : "border-border bg-card hover:border-muted"
                    }`}
                  >
                    <div
                      className={`text-base font-semibold mb-1.5 ${
                        form.kontotyp === id ? "text-accent" : "text-foreground"
                      }`}
                    >
                      {label}
                    </div>
                    <div className="text-[13px] text-muted leading-relaxed">
                      {desc}
                    </div>
                  </button>
                ))}
              </div>
              <Err k="kontotyp" />

              {/* Kostenübersicht */}
              {form.kontotyp && (
                <div className="mt-6 p-5 rounded-[10px] border border-border bg-subtle">
                  <h4 className="font-serif text-base font-bold mb-3">
                    Vergütung für die außergerichtliche Vertretung (Abmahnung)
                  </h4>
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b border-border-light">
                        <td className="py-2 text-muted">1,3 Geschäftsgebühr Nr. 2300, 1008 VV RVG</td>
                        <td className="py-2 text-right font-medium tabular-nums">
                          {formatCurrency(GEBUEHREN[form.kontotyp].geschaeftsgebuehr)}
                        </td>
                      </tr>
                      <tr className="border-b border-border-light">
                        <td className="py-2 text-muted">Auslagen Nr. 7001, 7002 VV RVG</td>
                        <td className="py-2 text-right font-medium tabular-nums">
                          {formatCurrency(GEBUEHREN[form.kontotyp].auslagen)}
                        </td>
                      </tr>
                      <tr className="border-b border-border-light">
                        <td className="py-2 text-muted">19% USt. Nr. 7008 VV RVG</td>
                        <td className="py-2 text-right font-medium tabular-nums">
                          {formatCurrency(GEBUEHREN[form.kontotyp].ust)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 font-semibold">Gesamtbetrag</td>
                        <td className="py-2 text-right font-bold tabular-nums">
                          {formatCurrency(GEBUEHREN[form.kontotyp].gesamt)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="text-xs text-faint mt-3 leading-relaxed">
                    Die Vergütung richtet sich nach dem Rechtsanwaltsvergütungsgesetz (RVG).
                    Sollte eine gerichtliche Durchsetzung erforderlich werden, fallen weitere gesetzliche Gebühren an.
                  </p>
                </div>
              )}

              {form.kontotyp === "GEWERBLICH" && (
                <>
                  <div className="h-px bg-border my-6" />
                  <p className="font-serif text-lg font-bold mb-4">
                    Gewerbliche Details
                  </p>

                  <div className="mb-5">
                    <label className="block text-sm font-semibold mb-1.5">
                      Wie nutzen Sie das Konto geschäftlich?
                    </label>
                    <textarea
                      value={form.gewerbBeschreibung}
                      onChange={(e) =>
                        set("gewerbBeschreibung", e.target.value)
                      }
                      placeholder="z.B. Bewerbung meiner Musik, Kooperationen…"
                      className={`${inputClass("gewerbBeschreibung")} min-h-[80px] resize-y`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div>
                      <label className="block text-sm font-semibold mb-1.5">
                        Follower / Abonnenten
                      </label>
                      <input
                        value={form.followerCount}
                        onChange={(e) =>
                          set("followerCount", e.target.value)
                        }
                        placeholder="z.B. 50.000"
                        className={inputClass("followerCount")}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1.5">
                        Monatl. Einnahmen (optional)
                      </label>
                      <input
                        value={form.monatlicheEinnahmen}
                        onChange={(e) =>
                          set("monatlicheEinnahmen", e.target.value)
                        }
                        placeholder="z.B. 5.000 €"
                        className={inputClass("monatlicheEinnahmen")}
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2.5 text-sm cursor-pointer mb-5">
                    <input
                      type="checkbox"
                      checked={form.vertraegeBetroffen}
                      onChange={(e) =>
                        set("vertraegeBetroffen", e.target.checked)
                      }
                      className="w-[18px] h-[18px] accent-accent"
                    />
                    Bestehende Werbe-/Kooperationsverträge betroffen
                  </label>

                  <div className="p-3.5 rounded-[10px] border border-green/20 bg-green-light">
                    <p className="text-sm font-semibold mb-1 text-green">
                      Stärkerer Verfügungsgrund
                    </p>
                    <p className="text-sm text-muted leading-relaxed">
                      Bei gewerblichen Konten liegt die Eilbedürftigkeit
                      regelmäßig vor – durch Umsatzeinbußen, gefährdete
                      Verträge und den Eingriff in den Gewerbebetrieb.
                    </p>
                  </div>
                </>
              )}

              {form.kontotyp === "PRIVAT" && (
                <div className="p-3.5 rounded-[10px] border border-amber/20 bg-amber-light mt-5">
                  <p className="text-sm font-semibold mb-1 text-amber">
                    Ansprüche bestehen auch hier
                  </p>
                  <p className="text-sm text-muted leading-relaxed">
                    Der Verfügungsgrund ergibt sich aus der fortdauernden
                    Verletzung Ihres Persönlichkeitsrechts und Ihrer
                    Meinungsfreiheit.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Step 4: Persönliche Daten */}
          {step === 4 && (
            <>
              <h2 className="font-serif text-2xl font-bold mb-1.5 tracking-tight">
                Ihre persönlichen Daten
              </h2>
              <p className="text-[15px] text-muted mb-7 leading-relaxed">
                Für das Mandatsverhältnis und das anwaltliche Schreiben.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-sm font-semibold mb-1.5">
                    Vorname *
                  </label>
                  <input
                    value={form.vorname}
                    onChange={(e) => set("vorname", e.target.value)}
                    className={inputClass("vorname")}
                  />
                  <Err k="vorname" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">
                    Nachname *
                  </label>
                  <input
                    value={form.nachname}
                    onChange={(e) => set("nachname", e.target.value)}
                    className={inputClass("nachname")}
                  />
                  <Err k="nachname" />
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-semibold mb-1.5">
                  Straße + Hausnr. *
                </label>
                <input
                  value={form.strasse}
                  onChange={(e) => set("strasse", e.target.value)}
                  className={inputClass("strasse")}
                />
                <Err k="strasse" />
              </div>

              <div className="grid grid-cols-[1fr_2fr] gap-4 mb-5">
                <div>
                  <label className="block text-sm font-semibold mb-1.5">
                    PLZ *
                  </label>
                  <input
                    value={form.plz}
                    onChange={(e) => set("plz", e.target.value)}
                    className={inputClass("plz")}
                  />
                  <Err k="plz" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">
                    Stadt *
                  </label>
                  <input
                    value={form.stadt}
                    onChange={(e) => set("stadt", e.target.value)}
                    className={inputClass("stadt")}
                  />
                  <Err k="stadt" />
                </div>
              </div>

              {/* Email with verification */}
              <div className="mb-5">
                <label className="block text-sm font-semibold mb-1.5">
                  E-Mail * {emailVerified && verifiedEmail === form.email && (
                    <span className="text-green font-normal ml-2">✓ Verifiziert</span>
                  )}
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    disabled={emailVerified && verifiedEmail === form.email}
                    className={`flex-1 ${inputClass("email")} ${emailVerified && verifiedEmail === form.email ? "bg-subtle" : ""}`}
                  />
                  {!emailVerified || verifiedEmail !== form.email ? (
                    <button
                      type="button"
                      onClick={sendVerificationCode}
                      disabled={sendingCode || !form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)}
                      className="px-4 py-2 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {sendingCode ? "Senden..." : codeSent ? "Erneut senden" : "Code senden"}
                    </button>
                  ) : null}
                </div>
                {errors.email && !codeSent && (
                  <p className="text-accent text-sm mt-1.5">{errors.email}</p>
                )}
              </div>

              {/* Verification code input */}
              {codeSent && (!emailVerified || verifiedEmail !== form.email) && (
                <div className="mb-5 p-4 bg-subtle rounded-lg border border-border">
                  <label className="block text-sm font-semibold mb-1.5">
                    Bestätigungscode eingeben
                  </label>
                  <p className="text-sm text-muted mb-3">
                    Wir haben einen 6-stelligen Code an {form.email} gesendet.
                  </p>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                        setVerificationCode(val);
                        if (errors.verificationCode) {
                          setErrors((prev) => {
                            const next = { ...prev };
                            delete next.verificationCode;
                            return next;
                          });
                        }
                      }}
                      placeholder="000000"
                      maxLength={6}
                      className="w-32 px-3.5 py-[11px] rounded-lg border-[1.5px] border-border bg-card text-foreground text-[15px] text-center tracking-[0.3em] font-mono outline-none focus:border-muted"
                    />
                    <button
                      type="button"
                      onClick={verifyCode}
                      disabled={verifyingCode || verificationCode.length !== 6}
                      className="px-4 py-2 bg-green text-white text-sm font-semibold rounded-lg hover:bg-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {verifyingCode ? "Prüfen..." : "Bestätigen"}
                    </button>
                  </div>
                  {errors.verificationCode && (
                    <p className="text-accent text-sm">{errors.verificationCode}</p>
                  )}
                  {resendCooldown > 0 ? (
                    <p className="text-sm text-muted mt-2">
                      Code erneut senden in {resendCooldown}s
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={sendVerificationCode}
                      disabled={sendingCode}
                      className="text-sm text-accent hover:underline mt-2"
                    >
                      Code erneut senden
                    </button>
                  )}
                </div>
              )}

              {/* Phone */}
              <div className="mb-5">
                <label className="block text-sm font-semibold mb-1.5">
                  Telefon
                </label>
                <input
                  value={form.telefon}
                  onChange={(e) => set("telefon", e.target.value)}
                  placeholder="optional"
                  className={inputClass("telefon")}
                />
              </div>
            </>
          )}

          {/* Step 5: Mandatierung */}
          {step === 5 && (
            <>
              <h2 className="font-serif text-2xl font-bold mb-1.5 tracking-tight">
                Zusammenfassung & Mandatierung
              </h2>
              <p className="text-[15px] text-muted mb-7 leading-relaxed">
                Prüfen Sie Ihre Angaben und erteilen Sie die Vollmacht.
              </p>

              {/* Summary */}
              <div className="bg-subtle rounded-[10px] p-5 mb-6">
                <SummaryRow
                  label="Plattform"
                  value={
                    form.platform
                      ? PLATFORM_CONFIG[form.platform].name
                      : "–"
                  }
                />
                <SummaryRow label={form.platform === "WHATSAPP" ? "Telefonnummer" : "Nutzername"} value={form.nutzername} />
                <SummaryRow
                  label="Gesperrt am"
                  value={
                    form.sperrDatum
                      ? new Date(form.sperrDatum).toLocaleDateString("de-DE")
                      : "–"
                  }
                />
                <SummaryRow
                  label="Sperrgrund"
                  value={
                    SPERR_GRUENDE.find((g) => g.value === form.sperrGrund)
                      ?.label ?? "–"
                  }
                />
                <SummaryRow
                  label="Kontotyp"
                  value={
                    form.kontotyp === "GEWERBLICH" ? "Gewerblich" : "Privat"
                  }
                />
                <SummaryRow
                  label="Verfahren"
                  value={
                    trackInfo?.track === "B_LAWSUIT"
                      ? "Abmahnung → Klage"
                      : "Abmahnung → Einstweilige Verfügung"
                  }
                  accent
                />
                <SummaryRow
                  label="Mandant"
                  value={`${form.vorname} ${form.nachname}`}
                />
                <SummaryRow
                  label="Adresse"
                  value={`${form.strasse}, ${form.plz} ${form.stadt}`}
                  last
                />
              </div>

              <div className="h-px bg-border my-6" />

              {/* Vergütung */}
              <div className="bg-subtle rounded-[10px] p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">Vergütung (außergerichtliche Vertretung)</span>
                  <span className="text-lg font-bold text-accent tabular-nums">
                    {form.kontotyp ? formatCurrency(GEBUEHREN[form.kontotyp].gesamt) : "–"} brutto
                  </span>
                </div>
                <p className="text-xs text-faint mt-1">
                  Streitwert: {form.kontotyp ? formatCurrency(GEBUEHREN[form.kontotyp].streitwert) : "–"} · gem. RVG
                </p>
              </div>

              {/* Checkboxes */}
              <div className="mb-4">
                <label className="flex items-start gap-2.5 text-sm cursor-pointer leading-relaxed">
                  <input
                    type="checkbox"
                    checked={form.vollmacht}
                    onChange={(e) => set("vollmacht", e.target.checked)}
                    className="w-[18px] h-[18px] accent-accent shrink-0 mt-0.5"
                  />
                  <span>
                    Ich erteile der DR. SARAFI Rechtsanwaltsgesellschaft mbH Vollmacht zur Vertretung meiner Interessen. *
                  </span>
                </label>
                <Err k="vollmacht" />
              </div>

              <div className="mb-4">
                <label className="flex items-start gap-2.5 text-sm cursor-pointer leading-relaxed">
                  <input
                    type="checkbox"
                    checked={form.verguetung}
                    onChange={(e) => set("verguetung", e.target.checked)}
                    className="w-[18px] h-[18px] accent-accent shrink-0 mt-0.5"
                  />
                  <span>
                    Ich akzeptiere die Vergütungsvereinbarung über{" "}
                    <strong>{form.kontotyp ? formatCurrency(GEBUEHREN[form.kontotyp].gesamt) : "–"}</strong> brutto
                    für die außergerichtliche Vertretung. *
                  </span>
                </label>
                <Err k="verguetung" />
              </div>

              <div className="mb-4">
                <label className="flex items-start gap-2.5 text-sm cursor-pointer leading-relaxed">
                  <input
                    type="checkbox"
                    checked={form.datenschutz}
                    onChange={(e) => set("datenschutz", e.target.checked)}
                    className="w-[18px] h-[18px] accent-accent shrink-0 mt-0.5"
                  />
                  <span>
                    Ich stimme der Datenverarbeitung gemäß Datenschutzerklärung zu. *
                  </span>
                </label>
                <Err k="datenschutz" />
              </div>

              {/* Zahlungsmethode */}
              <div className="h-px bg-border my-6" />
              <h3 className="font-serif text-lg font-bold mb-4">Zahlungsmethode wählen</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentProvider("stripe")}
                  className={`p-4 rounded-[10px] border-[1.5px] cursor-pointer text-left transition-colors ${
                    paymentProvider === "stripe"
                      ? "border-accent bg-accent-light"
                      : "border-border bg-card hover:border-muted"
                  }`}
                >
                  <div className={`text-base font-semibold mb-1 ${
                    paymentProvider === "stripe" ? "text-accent" : "text-foreground"
                  }`}>
                    Kreditkarte
                  </div>
                  <div className="text-[13px] text-muted">
                    Visa, Mastercard
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentProvider("ueberweisung")}
                  className={`p-4 rounded-[10px] border-[1.5px] cursor-pointer text-left transition-colors ${
                    paymentProvider === "ueberweisung"
                      ? "border-accent bg-accent-light"
                      : "border-border bg-card hover:border-muted"
                  }`}
                >
                  <div className={`text-base font-semibold mb-1 ${
                    paymentProvider === "ueberweisung" ? "text-accent" : "text-foreground"
                  }`}>
                    Überweisung
                  </div>
                  <div className="text-[13px] text-muted">
                    Banküberweisung
                  </div>
                </button>
              </div>
              <Err k="payment" />

              {errors.submit && (
                <div className="p-3.5 rounded-[10px] border border-accent/20 bg-accent-light mt-4">
                  <p className="text-sm text-accent">{errors.submit}</p>
                </div>
              )}
            </>
          )}

          {/* Navigation */}
          {step <= 5 && (
            <div className="flex justify-between mt-7">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prev}
                  className="text-muted text-sm px-4 py-2 hover:text-foreground transition-colors"
                >
                  ← Zurück
                </button>
              ) : (
                <div />
              )}
              {step < 5 ? (
                <button
                  type="button"
                  onClick={next}
                  disabled={step === 1 && (form.wohnsitzDE === false || (form.sperrDatum ? new Date(form.sperrDatum) > new Date() : false))}
                  className="btn-shine bg-accent text-white text-[15px] font-semibold px-7 py-3 rounded-lg disabled:bg-border disabled:cursor-default disabled:overflow-visible disabled:after:hidden"
                >
                  Weiter →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submit}
                  disabled={submitting}
                  className="bg-green text-white text-[15px] font-semibold px-7 py-3 rounded-lg hover:bg-green/90 transition-colors disabled:opacity-60"
                >
                  {submitting
                    ? "Wird erstellt..."
                    : "Kostenpflichtig beauftragen ✓"}
                </button>
              )}
            </div>
          )}
        </div>
        <DevoryCredit />
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  accent,
  last,
}: {
  label: string;
  value: string;
  accent?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={`flex justify-between py-2.5 ${
        last ? "" : "border-b border-border-light"
      }`}
    >
      <span className="text-sm text-muted">{label}</span>
      <span
        className={`text-sm font-semibold text-right ${
          accent ? "text-accent" : "text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
