"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PLATFORM_CONFIG, type PlatformKey } from "@/lib/platforms";
import { SPERR_GRUENDE } from "@/types";
import DevoryCredit from "@/components/DevoryCredit";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface CaseData {
  id: string;
  caseNumber: string;
  track: string;
  platform: PlatformKey;
  nutzername: string;
  registrierteEmail: string;
  sperrDatum: string;
  sperrGrund: string;
  sperrGrundFreitext: string | null;
  sperrDetails: string | null;
  kontotyp: string;
  gewerbBeschreibung: string | null;
  followerCount: string | null;
  monatlicheEinnahmen: string | null;
  vertraegeBetroffen: boolean;
  abmahnfristDatum: string;
  createdAt: string;
  user: {
    vorname: string;
    nachname: string;
    strasse: string;
    plz: string;
    stadt: string;
  };
}

export default function AbmahnungPage() {
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
        <p className="text-muted">Lade Abmahnung...</p>
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
  const f = caseData;
  const u = caseData.user;

  const fmtDate = (d: string) =>
    format(new Date(d), "dd.MM.yyyy", { locale: de });
  const fmtDateLong = (d: string) =>
    format(new Date(d), "EEEE, d. MMMM yyyy", { locale: de });

  const grund =
    SPERR_GRUENDE.find((g) => g.value === f.sperrGrund)?.label ??
    f.sperrGrundFreitext ??
    "—";

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

      <div className="max-w-[720px] mx-auto px-6 pt-8 pb-20">
        <div
          className="bg-white border border-border rounded font-serif text-sm leading-[1.8] text-[#111]"
          style={{
            padding: "56px",
            boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
          }}
        >
          {/* Briefkopf */}
          <div className="border-b-2 border-[#111] pb-4 mb-8">
            <div className="font-sans text-[11px] font-bold tracking-[2px] uppercase text-[#666] mb-1">
              DR. SARAFI Rechtsanwaltsgesellschaft mbH
            </div>
            <div className="text-lg font-bold">AccountHilfe.de</div>
            <div className="font-sans text-[11px] text-[#888] mt-1">
              Leerbachstraße 54 · 60322 Frankfurt am Main · info@sarafi.de
            </div>
          </div>

          {/* Adressat */}
          <div className="font-sans text-[13px] text-[#444] mb-8 leading-relaxed">
            {pl.antragsgegner}
            <br />
            {pl.adresse}
          </div>

          {/* Datum */}
          <div className="text-right font-sans text-[13px] text-[#666] mb-8">
            Frankfurt am Main, den {fmtDate(f.createdAt)}
          </div>

          {/* Titel */}
          <h1 className="font-sans text-[15px] font-bold tracking-[4px] uppercase text-center mb-2">
            A B M A H N U N G
          </h1>
          <p className="font-sans text-[13px] text-center text-[#444] mb-8">
            {u.vorname} {u.nachname} ./. {pl.antragsgegner} –
            Unterlassungsaufforderung
          </p>

          <p>Sehr geehrte Damen und Herren,</p>

          <p>
            hiermit zeigen wir an, dass wir die rechtlichen Interessen des
            Herrn {u.vorname} {u.nachname}, {u.strasse}, {u.plz} {u.stadt},
            vertreten. Ordnungsgemäße Bevollmächtigung wird anwaltlich
            versichert. Wir weisen darauf hin, dass der Nachweis der
            schriftlichen Bevollmächtigung keine Wirksamkeitsvoraussetzung
            darstellt (BGH, Urteil vom 19.&nbsp;Mai 2010, I&nbsp;ZR&nbsp;140/08).
          </p>

          <p>
            Gegenstand unserer Beauftragung ist die unrechtmäßige Sperrung{" "}
            {pl.bezeichnung} unseres Mandanten am{" "}
            {fmtDateLong(f.sperrDatum)}
          </p>

          <ul className="list-disc pl-6 my-2">
            <li>Nutzername: {f.nutzername}</li>
            <li>Verknüpft mit E-Mail: {f.registrierteEmail}</li>
          </ul>

          <p>
            Mit diesem Schreiben fordern wir Sie außergerichtlich auf, die
            Sperre {pl.bezeichnungGenitiv} unseres Mandanten sowie sämtliche
            damit verknüpfte Seiten unverzüglich aufzuheben und sie in einen
            Zustand ohne jegliche Einschränkungen zurückzusetzen.
          </p>

          <p>Im Einzelnen:</p>

          <h2 className="text-sm font-bold mt-6 mb-2">I. Sachverhalt</h2>

          {f.kontotyp === "GEWERBLICH" ? (
            <p>
              Unser Mandant nutzt {pl.name} gewerblich.
              {f.gewerbBeschreibung ? ` ${f.gewerbBeschreibung}` : ""}
              {f.followerCount
                ? ` Das Konto verfügt über ca. ${f.followerCount} Follower bzw. Abonnenten.`
                : ""}
              {f.monatlicheEinnahmen
                ? ` Über die Plattform generiert unser Mandant monatliche Einnahmen in Höhe von ca. ${f.monatlicheEinnahmen}.`
                : ""}
              {f.vertraegeBetroffen
                ? " Es bestehen aktive Werbe- und Kooperationsverträge, die durch die Sperrung unmittelbar gefährdet sind."
                : ""}
            </p>
          ) : (
            <p>
              Unser Mandant nutzt {pl.name} im privaten Rahmen zur
              persönlichen Meinungsäußerung und zum Austausch mit seiner
              Community.
            </p>
          )}

          <p>
            Am {fmtDateLong(f.sperrDatum)} sperrten Sie das Konto unseres
            Mandanten unter Hinweis auf angebliche Verstöße gegen die
            Gemeinschaftsstandards ({grund}).
            {f.sperrDetails ? ` ${f.sperrDetails}` : ""}
          </p>

          <h2 className="text-sm font-bold mt-6 mb-2">
            II. Zu den Pflichten der Betreiber sozialer Netzwerke
          </h2>

          <p>
            <strong>1. Vertragliche Pflichten</strong>
          </p>
          <p>
            Zwischen unserem Mandanten und Ihnen besteht ein
            rechtsgeschäftliches Dauerschuldverhältnis, kraft dessen Sie gemäß
            §§&nbsp;311 Abs.&nbsp;1, 241 Abs.&nbsp;1 BGB verpflichtet sind,
            unserem Mandanten die Nutzung der Plattform {pl.name} zu
            ermöglichen, solange er hierbei nicht gegen geltendes deutsches
            oder europäisches Recht oder Ihre Nutzungsbedingungen verstößt,
            wobei Ihre Nutzungsbedingungen nach dem Maßstab der AGB-Kontrolle
            (§§&nbsp;305&nbsp;ff. BGB) nicht unangemessen benachteiligend
            gegenüber unserem Mandanten sein dürfen. Zu betonen ist hierbei,
            dass Sie auch im Rahmen der mittelbaren Grundrechtsdrittwirkung an
            verschiedene Grundrechte gebunden sind.
          </p>

          <p>
            <strong>2. BGH-Rechtsprechung</strong>
          </p>
          <p>
            Ihnen sind die Urteile des Bundesgerichtshofs vom
            29.&nbsp;Juli 2021 (Az.&nbsp;III&nbsp;ZR&nbsp;179/20 und
            III&nbsp;ZR&nbsp;192/20) bekannt, in denen klargestellt wurde,
            dass es Plattformbetreibern verwehrt ist, Nutzerkonten ohne
            sachlichen Grund und damit willkürlich zu löschen sowie dass ein
            vorheriges Anhörungsverfahren durchzuführen ist.
          </p>

          {pl.isVLOP && (
            <>
              <p>
                <strong>3. Unionsrechtliche Pflichten</strong>
              </p>
              <p>
                Für Sie als Very Large Online Platform (VLOP) im Sinne des
                Digital Services Acts (DSA) – EU-Verordnung 2022/2065 –
                ergibt sich aus Art.&nbsp;14 Abs.&nbsp;4 DSA eine
                unmittelbare Bindung an die EU-Grundrechtecharta. Danach ist
                es Ihnen untersagt, Nutzer willkürlich zu sperren. Sie sind
                verpflichtet, sorgfältig, objektiv und verhältnismäßig
                vorzugehen. Weiterhin sind Sie nach Art.&nbsp;17 Abs.&nbsp;1
                DSA verpflichtet, jegliche Beschränkungen zu begründen.
              </p>
            </>
          )}

          <h2 className="text-sm font-bold mt-6 mb-2">III. Fazit</h2>

          <p>
            Es ergibt sich Ihre Pflicht zur Gewährung der Nutzung der
            Plattform {pl.name} nicht nur aus dem bestehenden
            Vertragsverhältnis, sondern zugleich aus der Verpflichtung zur
            Beachtung der deutschen Grundrechte sowie der Charta der
            Grundrechte der Europäischen Union.
          </p>

          {f.kontotyp === "GEWERBLICH" ? (
            <p>
              Für unseren Mandanten ist die uneingeschränkte Nutzung seines
              Kontos auf {pl.name} von erheblicher Bedeutung.
              {f.followerCount
                ? ` Ihm folgen dort ca. ${f.followerCount} Menschen.`
                : ""}{" "}
              Er nutzt diese Plattform nicht nur zur Entfaltung seiner
              Meinungsäußerung und seines allgemeinen Persönlichkeitsrechts,
              sondern vor allem auch zur Bewerbung seines Geschäftsbetriebs.
              Die Sperrung stellt einen unzulässigen Eingriff in sein
              allgemeines Persönlichkeitsrecht gemäß Art.&nbsp;2 Abs.&nbsp;1
              i.V.m. Art.&nbsp;1 Abs.&nbsp;1 GG, in seine Meinungsfreiheit
              nach Art.&nbsp;5 Abs.&nbsp;1 GG sowie in seine
              Berufsausübungsfreiheit nach Art.&nbsp;12 Abs.&nbsp;1 GG dar.
              Jede Stunde, in der er sein Konto nicht nutzen kann, verursacht
              ihm erhebliche wirtschaftliche Nachteile. Es ist nicht
              hinnehmbar, diesen Zustand fortbestehen zu lassen.
            </p>
          ) : (
            <p>
              Für unseren Mandanten ist die uneingeschränkte Nutzung seines
              Kontos auf {pl.name} von erheblicher Bedeutung. Die Sperrung
              stellt einen unzulässigen Eingriff in sein allgemeines
              Persönlichkeitsrecht gemäß Art.&nbsp;2 Abs.&nbsp;1 i.V.m.
              Art.&nbsp;1 Abs.&nbsp;1 GG sowie in seine Meinungsfreiheit
              nach Art.&nbsp;5 Abs.&nbsp;1 GG dar.
            </p>
          )}

          {/* Frist-Box */}
          <div className="my-7 p-4 border border-[#ccc] bg-[#FAFAF8]">
            <p>
              Wir fordern Sie namens und im Auftrag unseres Mandanten auf,
              unverzüglich, spätestens bis
            </p>
            <p className="text-center font-bold text-[15px] my-3">
              {fmtDateLong(f.abmahnfristDatum)}, 12:00 Uhr (UTC+1)
            </p>
            <p>
              das Nutzerkonto unseres Mandanten zu entsperren und den Zustand
              wiederherzustellen, der vor der Sperre am{" "}
              {fmtDateLong(f.sperrDatum)} bestand.
            </p>
            <p>
              Weil Sie unserem Mandanten gegenüber nicht nur zur Beseitigung,
              sondern auch zur (künftigen) Unterlassung verpflichtet sind,
              haben wir Sie ebenso aufzufordern, sich bis zum genannten Datum
              im Wege einer strafbewehrten Unterlassungserklärung
              rechtsverbindlich zu verpflichten, künftige Rechtsverletzungen
              zu unterlassen.
            </p>
          </div>

          <p>
            Im Falle des fruchtlosen Ablaufs der vorgenannten Fristen werden
            wir unmittelbar und ohne weitere Ankündigung gerichtliche Hilfe in
            Anspruch nehmen und{" "}
            {f.track === "A_INJUNCTION"
              ? "den Erlass einer einstweiligen Verfügung"
              : "Klage auf Wiederherstellung und Schadensersatz"}{" "}
            gegen Sie beantragen.
          </p>

          <p>
            Nehmen Sie zur Kenntnis, dass sich unser Mandant in jedem Falle
            die Geltendmachung von materiellem und immateriellem
            Schadensersatz gegen Sie vorbehält.
          </p>

          <p className="mt-10">Mit freundlichen Grüßen</p>

          <div className="mt-10 border-t border-[#999] w-[200px] pt-2 font-sans text-xs text-[#666]">
            Rechtsanwalt / Rechtsanwältin
            <br />
            DR. SARAFI Rechtsanwaltsgesellschaft mbH
          </div>
        </div>
        <DevoryCredit />
      </div>
    </div>
  );
}
