import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import { PLATFORM_CONFIG } from "./platforms";
import { format } from "date-fns";
import { de, enUS } from "date-fns/locale";
import type { AbmahnungData } from "./abmahnung-template";

const fmtDatum = (d: Date, lang: "de" | "en") =>
  lang === "de"
    ? format(d, "d. MMMM yyyy", { locale: de })
    : format(d, "MMMM d, yyyy", { locale: enUS });

const fmtDatumLang = (d: Date, lang: "de" | "en") =>
  lang === "de"
    ? format(d, "EEEE, 'den' d. MMMM yyyy", { locale: de })
    : format(d, "EEEE, MMMM d, yyyy", { locale: enUS });

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.6,
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: 65,
    color: "#111",
  },
  headerBar: {
    borderBottomWidth: 1.5,
    borderBottomColor: "#111",
    paddingBottom: 12,
    marginBottom: 30,
  },
  headerKanzlei: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#666",
    marginBottom: 2,
  },
  headerBrand: {
    fontFamily: "Helvetica-Bold",
    fontSize: 14,
    marginBottom: 2,
  },
  headerAddress: {
    fontSize: 7.5,
    color: "#888",
  },
  recipient: {
    fontSize: 10,
    color: "#444",
    marginBottom: 20,
    lineHeight: 1.5,
  },
  dateLine: {
    textAlign: "right",
    fontSize: 9,
    color: "#666",
    marginBottom: 25,
  },
  title: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    letterSpacing: 4,
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 9,
    textAlign: "center",
    color: "#444",
    marginBottom: 20,
  },
  paragraph: {
    fontSize: 10,
    lineHeight: 1.7,
    marginBottom: 8,
    textAlign: "justify",
  },
  heading: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    marginTop: 16,
    marginBottom: 6,
  },
  subheading: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    marginTop: 10,
    marginBottom: 4,
  },
  listItem: {
    fontSize: 10,
    lineHeight: 1.7,
    marginBottom: 2,
    paddingLeft: 12,
  },
  fristBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#FAFAF8",
    padding: 14,
    marginVertical: 14,
  },
  fristDate: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    textAlign: "center",
    marginVertical: 8,
  },
  signatureBlock: {
    marginTop: 40,
  },
  signatureLine: {
    borderTopWidth: 0.75,
    borderTopColor: "#999",
    width: 180,
    paddingTop: 6,
    marginTop: 30,
  },
  signatureName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    marginBottom: 1,
  },
  signatureRole: {
    fontSize: 8,
    color: "#666",
  },
  bold: {
    fontFamily: "Helvetica-Bold",
  },
});

const texts = {
  de: {
    title: "A B M A H N U N G",
    subtitleSuffix: "Unterlassungsaufforderung",
    salutation: "Sehr geehrte Damen und Herren,",
    intro: (name: string, strasse: string, plz: string, stadt: string) =>
      `hiermit zeigen wir an, dass wir die rechtlichen Interessen des Herrn ${name}, ${strasse}, ${plz} ${stadt}, vertreten. Ordnungsgem\u00e4\u00dfe Bevollm\u00e4chtigung wird anwaltlich versichert. Wir weisen darauf hin, dass der Nachweis der schriftlichen Bevollm\u00e4chtigung keine Wirksamkeitsvoraussetzung darstellt (BGH, Urteil vom 19. Mai 2010, I ZR 140/08).`,
    subject: (bezeichnung: string, date: string) =>
      `Gegenstand unserer Beauftragung ist die unrechtm\u00e4\u00dfige Sperrung ${bezeichnung} unseres Mandanten am ${date}`,
    username: "Nutzername",
    email: "Verkn\u00fcpft mit E-Mail",
    demand: (bezeichnungGenitiv: string) =>
      `Mit diesem Schreiben fordern wir Sie au\u00dfergerichtlich auf, die Sperre ${bezeichnungGenitiv} unseres Mandanten sowie s\u00e4mtliche damit verkn\u00fcpfte Seiten unverz\u00fcglich aufzuheben und sie in einen Zustand ohne jegliche Einschr\u00e4nkungen zur\u00fcckzusetzen.`,
    details: "Im Einzelnen:",
    headingFacts: "I. Sachverhalt",
    commercialUse: (name: string) => `Unser Mandant nutzt ${name} gewerblich.`,
    followerText: (count: string) =>
      ` Das Konto verf\u00fcgt \u00fcber ca. ${count} Follower bzw. Abonnenten.`,
    revenueText: (amount: string) =>
      ` \u00dcber die Plattform generiert unser Mandant monatliche Einnahmen in H\u00f6he von ca. ${amount}.`,
    contractsAffected:
      " Es bestehen aktive Werbe- und Kooperationsvertr\u00e4ge, die durch die Sperrung unmittelbar gef\u00e4hrdet sind.",
    privateUse: (name: string) =>
      `Unser Mandant nutzt ${name} im privaten Rahmen zur pers\u00f6nlichen Meinungs\u00e4u\u00dferung und zum Austausch mit seiner Community.`,
    lockReason: (date: string, grund: string) =>
      `Am ${date} sperrten Sie das Konto unseres Mandanten unter Hinweis auf angebliche Verst\u00f6\u00dfe gegen die Gemeinschaftsstandards (${grund}).`,
    headingDuties: "II. Zu den Pflichten der Betreiber sozialer Netzwerke",
    subContractual: "1. Vertragliche Pflichten",
    contractualText: (name: string) =>
      `Zwischen unserem Mandanten und Ihnen besteht ein rechtsgesch\u00e4ftliches Dauerschuldverh\u00e4ltnis, kraft dessen Sie gem\u00e4\u00df \u00a7\u00a7 311 Abs. 1, 241 Abs. 1 BGB verpflichtet sind, unserem Mandanten die Nutzung der Plattform ${name} zu erm\u00f6glichen, solange er hierbei nicht gegen geltendes deutsches oder europ\u00e4isches Recht oder Ihre Nutzungsbedingungen verst\u00f6\u00dft, wobei Ihre Nutzungsbedingungen nach dem Ma\u00dfstab der AGB-Kontrolle (\u00a7\u00a7 305 ff. BGB) nicht unangemessen benachteiligend gegen\u00fcber unserem Mandanten sein d\u00fcrfen. Zu betonen ist hierbei, dass Sie auch im Rahmen der mittelbaren Grundrechtsdrittwirkung an verschiedene Grundrechte gebunden sind.`,
    subBGH: "2. BGH-Rechtsprechung",
    bghText:
      "Ihnen sind die Urteile des Bundesgerichtshofs vom 29. Juli 2021 (Az. III ZR 179/20 und III ZR 192/20) bekannt, in denen klargestellt wurde, dass es Plattformbetreibern verwehrt ist, Nutzerkonten ohne sachlichen Grund und damit willk\u00fcrlich zu l\u00f6schen sowie dass ein vorheriges Anh\u00f6rungsverfahren durchzuf\u00fchren ist.",
    subDSA: "3. Unionsrechtliche Pflichten",
    dsaText:
      "F\u00fcr Sie als Very Large Online Platform (VLOP) im Sinne des Digital Services Acts (DSA) \u2013 EU-Verordnung 2022/2065 \u2013 ergibt sich aus Art. 14 Abs. 4 DSA eine unmittelbare Bindung an die EU-Grundrechtecharta. Danach ist es Ihnen untersagt, Nutzer willk\u00fcrlich zu sperren. Sie sind verpflichtet, sorgf\u00e4ltig, objektiv und verh\u00e4ltnism\u00e4\u00dfig vorzugehen. Weiterhin sind Sie nach Art. 17 Abs. 1 DSA verpflichtet, jegliche Beschr\u00e4nkungen zu begr\u00fcnden.",
    headingConclusion: "III. Fazit",
    conclusionIntro: (name: string) =>
      `Es ergibt sich Ihre Pflicht zur Gew\u00e4hrung der Nutzung der Plattform ${name} nicht nur aus dem bestehenden Vertragsverh\u00e4ltnis, sondern zugleich aus der Verpflichtung zur Beachtung der deutschen Grundrechte sowie der Charta der Grundrechte der Europ\u00e4ischen Union.`,
    conclusionCommercial: (name: string, followerCount?: string) =>
      `F\u00fcr unseren Mandanten ist die uneingeschr\u00e4nkte Nutzung seines Kontos auf ${name} von erheblicher Bedeutung.${followerCount ? ` Ihm folgen dort ca. ${followerCount} Menschen.` : ""} Er nutzt diese Plattform nicht nur zur Entfaltung seiner Meinungs\u00e4u\u00dferung und seines allgemeinen Pers\u00f6nlichkeitsrechts, sondern vor allem auch zur Bewerbung seines Gesch\u00e4ftsbetriebs. Die Sperrung stellt einen unzul\u00e4ssigen Eingriff in sein allgemeines Pers\u00f6nlichkeitsrecht gem\u00e4\u00df Art. 2 Abs. 1 i.V.m. Art. 1 Abs. 1 GG, in seine Meinungsfreiheit nach Art. 5 Abs. 1 GG sowie in seine Berufsaus\u00fcbungsfreiheit nach Art. 12 Abs. 1 GG dar. Jede Stunde, in der er sein Konto nicht nutzen kann, verursacht ihm erhebliche wirtschaftliche Nachteile. Es ist nicht hinnehmbar, diesen Zustand fortbestehen zu lassen.`,
    conclusionPrivate: (name: string) =>
      `F\u00fcr unseren Mandanten ist die uneingeschr\u00e4nkte Nutzung seines Kontos auf ${name} von erheblicher Bedeutung. Die Sperrung stellt einen unzul\u00e4ssigen Eingriff in sein allgemeines Pers\u00f6nlichkeitsrecht gem\u00e4\u00df Art. 2 Abs. 1 i.V.m. Art. 1 Abs. 1 GG sowie in seine Meinungsfreiheit nach Art. 5 Abs. 1 GG dar.`,
    deadlinePre: "Wir fordern Sie namens und im Auftrag unseres Mandanten auf, unverz\u00fcglich, sp\u00e4testens bis",
    deadlinePost: (sperrDatum: string) =>
      `das Nutzerkonto unseres Mandanten zu entsperren und den Zustand wiederherzustellen, der vor der Sperre am ${sperrDatum} bestand.`,
    deadlineCeaseDesist:
      "Weil Sie unserem Mandanten gegen\u00fcber nicht nur zur Beseitigung, sondern auch zur (k\u00fcnftigen) Unterlassung verpflichtet sind, haben wir Sie ebenso aufzufordern, sich bis zum genannten Datum im Wege einer strafbewehrten Unterlassungserkl\u00e4rung rechtsverbindlich zu verpflichten, k\u00fcnftige Rechtsverletzungen zu unterlassen.",
    courtAction: (measure: string) =>
      `Im Falle des fruchtlosen Ablaufs der vorgenannten Fristen werden wir unmittelbar und ohne weitere Ank\u00fcndigung gerichtliche Hilfe in Anspruch nehmen und ${measure} gegen Sie beantragen.`,
    reserveRights:
      "Nehmen Sie zur Kenntnis, dass sich unser Mandant in jedem Falle die Geltendmachung von materiellem und immateriellem Schadensersatz gegen Sie vorbeh\u00e4lt.",
    courtMeasureA: "den Erlass einer einstweligen Verf\u00fcgung",
    courtMeasureB: "Klage auf Wiederherstellung und Schadensersatz",
    closing: "Mit freundlichen Gr\u00fc\u00dfen",
    dateLine: (date: string) => `Frankfurt am Main, den ${date}`,
    deadlineTime: "12:00 Uhr (UTC+1)",
  },
  en: {
    title: "CEASE AND DESIST LETTER",
    subtitleSuffix: "Demand to Cease and Desist",
    salutation: "Dear Sir or Madam,",
    intro: (name: string, strasse: string, plz: string, stadt: string) =>
      `We hereby inform you that we represent the legal interests of Mr. ${name}, ${strasse}, ${plz} ${stadt}, Germany. Proper authorization is assured by counsel. We note that proof of written authorization is not a prerequisite for its validity (German Federal Court of Justice, judgment of May 19, 2010, case no. I ZR 140/08).`,
    subject: (bezeichnung: string, date: string) =>
      `The subject of our engagement is the unlawful suspension of ${bezeichnung} of our client on ${date}`,
    username: "Username",
    email: "Associated email",
    demand: (bezeichnungGenitiv: string) =>
      `By this letter, we demand that you immediately lift the suspension of ${bezeichnungGenitiv} of our client as well as all associated pages and restore them to a state without any restrictions.`,
    details: "In detail:",
    headingFacts: "I. Facts",
    commercialUse: (name: string) =>
      `Our client uses ${name} for commercial purposes.`,
    followerText: (count: string) =>
      ` The account has approximately ${count} followers/subscribers.`,
    revenueText: (amount: string) =>
      ` Our client generates monthly revenues of approximately ${amount} through the platform.`,
    contractsAffected:
      " There are active advertising and cooperation agreements that are directly jeopardized by the suspension.",
    privateUse: (name: string) =>
      `Our client uses ${name} privately for personal expression and interaction with their community.`,
    lockReason: (date: string, grund: string) =>
      `On ${date}, you suspended our client's account citing alleged violations of the community standards (${grund}).`,
    headingDuties: "II. Obligations of Social Network Operators",
    subContractual: "1. Contractual Obligations",
    contractualText: (name: string) =>
      `A contractual relationship exists between our client and your company, under which you are obligated pursuant to Sections 311(1), 241(1) of the German Civil Code (BGB) to enable our client to use the ${name} platform, provided that they do not violate applicable German or European law or your terms of service. Your terms of service must not unreasonably disadvantage our client under the standard terms control provisions (Sections 305 et seq. BGB). It should be emphasized that you are also bound by various fundamental rights through the indirect horizontal effect of fundamental rights.`,
    subBGH: "2. Case Law of the German Federal Court of Justice (BGH)",
    bghText:
      "You are aware of the judgments of the German Federal Court of Justice of July 29, 2021 (case nos. III ZR 179/20 and III ZR 192/20), which clarified that platform operators are prohibited from deleting user accounts without objective reason and thus arbitrarily, and that a prior hearing procedure must be conducted.",
    subDSA: "3. EU Law Obligations",
    dsaText:
      "As a Very Large Online Platform (VLOP) within the meaning of the Digital Services Act (DSA) \u2013 EU Regulation 2022/2065 \u2013 Article 14(4) DSA imposes a direct obligation on you to comply with the EU Charter of Fundamental Rights. Accordingly, you are prohibited from arbitrarily suspending users. You are required to act carefully, objectively, and proportionately. Furthermore, under Article 17(1) DSA, you are obligated to provide reasons for any restrictions.",
    headingConclusion: "III. Conclusion",
    conclusionIntro: (name: string) =>
      `Your obligation to grant use of the ${name} platform arises not only from the existing contractual relationship, but also from the obligation to respect German fundamental rights and the Charter of Fundamental Rights of the European Union.`,
    conclusionCommercial: (name: string, followerCount?: string) =>
      `The unrestricted use of his account on ${name} is of considerable importance to our client.${followerCount ? ` He has approximately ${followerCount} followers there.` : ""} He uses this platform not only for the exercise of his freedom of expression and his general personality rights, but above all for the promotion of his business. The suspension constitutes an inadmissible interference with his general personality right under Article 2(1) in conjunction with Article 1(1) of the German Basic Law (GG), his freedom of expression under Article 5(1) GG, and his freedom to exercise his profession under Article 12(1) GG. Every hour that he cannot use his account causes him considerable economic damage. It is unacceptable to allow this situation to persist.`,
    conclusionPrivate: (name: string) =>
      `The unrestricted use of his account on ${name} is of considerable importance to our client. The suspension constitutes an inadmissible interference with his general personality right under Article 2(1) in conjunction with Article 1(1) of the German Basic Law (GG) and his freedom of expression under Article 5(1) GG.`,
    deadlinePre:
      "On behalf of and by instruction of our client, we demand that you immediately, but no later than",
    deadlinePost: (sperrDatum: string) =>
      `restore our client's user account and reinstate the condition that existed prior to the suspension on ${sperrDatum}.`,
    deadlineCeaseDesist:
      "Since you are obligated not only to remedy the current situation but also to refrain from future infringements, we further demand that you commit, by the aforementioned date, by way of a penalty-backed cease and desist declaration, to refrain from future violations of rights.",
    courtAction: (measure: string) =>
      `In the event that the aforementioned deadlines expire without compliance, we will immediately and without further notice seek judicial relief and apply for ${measure} against you.`,
    reserveRights:
      "Please note that our client reserves the right to claim material and immaterial damages against you in any event.",
    courtMeasureA: "interim injunctive relief",
    courtMeasureB: "a lawsuit for restoration and damages",
    closing: "Yours faithfully,",
    dateLine: (date: string) => `Frankfurt am Main, ${date}`,
    deadlineTime: "12:00 noon (UTC+1)",
  },
};

function AbmahnungDocument({
  data,
  lang = "de",
}: {
  data: AbmahnungData;
  lang?: "de" | "en";
}) {
  const pl = PLATFORM_CONFIG[data.platform];
  const t = texts[lang];
  const gerichtlicheMassnahme =
    data.track === "A_INJUNCTION" ? t.courtMeasureA : t.courtMeasureB;

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Briefkopf */}
        <View style={s.headerBar}>
          <Text style={s.headerKanzlei}>
            DR. SARAFI Rechtsanwaltsgesellschaft mbH
          </Text>
          <Text style={s.headerBrand}>AccountHilfe.de</Text>
          <Text style={s.headerAddress}>
            Leerbachstra\u00dfe 54 \u00b7 60322 Frankfurt am Main \u00b7
            info@sarafi.de
          </Text>
        </View>

        {/* Empfaenger */}
        <View style={s.recipient}>
          <Text>{pl.antragsgegner}</Text>
          <Text>{pl.adresse}</Text>
        </View>

        {/* Datum */}
        <Text style={s.dateLine}>
          {t.dateLine(fmtDatum(data.erstellDatum, lang))}
        </Text>

        {/* Titel */}
        <Text style={s.title}>{t.title}</Text>
        <Text style={s.subtitle}>
          {data.vorname} {data.nachname} ./. {pl.antragsgegner} {"\u2013"}{" "}
          {t.subtitleSuffix}
        </Text>

        {/* Anrede + Einleitung */}
        <Text style={s.paragraph}>{t.salutation}</Text>
        <Text style={s.paragraph}>
          {t.intro(
            `${data.vorname} ${data.nachname}`,
            data.strasse,
            data.plz,
            data.stadt
          )}
        </Text>

        <Text style={s.paragraph}>
          {t.subject(pl.bezeichnung, fmtDatum(data.sperrDatum, lang))}
        </Text>

        <Text style={s.listItem}>
          {"\u2022"} {t.username}: {data.nutzername}
        </Text>
        <Text style={s.listItem}>
          {"\u2022"} {t.email}: {data.registrierteEmail}
        </Text>

        <Text style={[s.paragraph, { marginTop: 8 }]}>
          {t.demand(pl.bezeichnungGenitiv)}
        </Text>

        <Text style={s.paragraph}>{t.details}</Text>

        {/* I. Sachverhalt / Facts */}
        <Text style={s.heading}>{t.headingFacts}</Text>

        {data.kontotyp === "GEWERBLICH" ? (
          <Text style={s.paragraph}>
            {t.commercialUse(pl.name)}
            {data.gewerbBeschreibung ? ` ${data.gewerbBeschreibung}` : ""}
            {data.followerCount ? t.followerText(data.followerCount) : ""}
            {data.monatlicheEinnahmen
              ? t.revenueText(data.monatlicheEinnahmen)
              : ""}
            {data.vertraegeBetroffen ? t.contractsAffected : ""}
          </Text>
        ) : (
          <Text style={s.paragraph}>{t.privateUse(pl.name)}</Text>
        )}

        <Text style={s.paragraph}>
          {t.lockReason(fmtDatum(data.sperrDatum, lang), data.sperrGrund)}
          {data.sperrDetails ? ` ${data.sperrDetails}` : ""}
        </Text>

        {/* II. Pflichten / Duties */}
        <Text style={s.heading}>{t.headingDuties}</Text>

        <Text style={s.subheading}>{t.subContractual}</Text>
        <Text style={s.paragraph}>{t.contractualText(pl.name)}</Text>

        <Text style={s.subheading}>{t.subBGH}</Text>
        <Text style={s.paragraph}>{t.bghText}</Text>

        {/* DSA-Block nur fuer VLOPs */}
        {pl.isVLOP && (
          <>
            <Text style={s.subheading}>{t.subDSA}</Text>
            <Text style={s.paragraph}>{t.dsaText}</Text>
          </>
        )}

        {/* III. Fazit / Conclusion */}
        <Text style={s.heading}>{t.headingConclusion}</Text>
        <Text style={s.paragraph}>{t.conclusionIntro(pl.name)}</Text>

        {data.kontotyp === "GEWERBLICH" ? (
          <Text style={s.paragraph}>
            {t.conclusionCommercial(pl.name, data.followerCount)}
          </Text>
        ) : (
          <Text style={s.paragraph}>{t.conclusionPrivate(pl.name)}</Text>
        )}

        {/* Frist-Box / Deadline Box */}
        <View style={s.fristBox}>
          <Text style={s.paragraph}>{t.deadlinePre}</Text>
          <Text style={s.fristDate}>
            {fmtDatumLang(data.fristDatum, lang)}, {t.deadlineTime}
          </Text>
          <Text style={s.paragraph}>
            {t.deadlinePost(fmtDatum(data.sperrDatum, lang))}
          </Text>
          <Text style={s.paragraph}>{t.deadlineCeaseDesist}</Text>
        </View>

        <Text style={s.paragraph}>{t.courtAction(gerichtlicheMassnahme)}</Text>

        <Text style={s.paragraph}>{t.reserveRights}</Text>

        {/* Unterschrift / Signature */}
        <View style={s.signatureBlock}>
          <Text style={s.paragraph}>{t.closing}</Text>
          <View style={s.signatureLine}>
            <Text style={s.signatureName}>
              DR. SARAFI Rechtsanwaltsgesellschaft mbH
            </Text>
            <Text style={s.signatureRole}>Rechtsanwalt Dr. Nik Sarafi</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export async function generateAbmahnungPdf(
  data: AbmahnungData,
  lang: "de" | "en" = "de"
): Promise<Buffer> {
  return renderToBuffer(<AbmahnungDocument data={data} lang={lang} />);
}
