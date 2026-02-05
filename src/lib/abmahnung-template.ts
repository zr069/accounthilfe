import { PLATFORM_CONFIG } from "./platforms";
import { format } from "date-fns";
import { de } from "date-fns/locale";

type AbmahnungData = {
  // Mandant
  vorname: string;
  nachname: string;
  strasse: string;
  plz: string;
  stadt: string;
  // Konto
  platform: keyof typeof PLATFORM_CONFIG;
  nutzername: string;
  registrierteEmail: string;
  sperrDatum: Date;
  sperrGrund: string;
  sperrDetails?: string;
  // Kontotyp
  kontotyp: "PRIVAT" | "GEWERBLICH";
  gewerbBeschreibung?: string;
  followerCount?: string;
  monatlicheEinnahmen?: string;
  vertraegeBetroffen?: boolean;
  // Frist
  fristDatum: Date;
  // Track
  track: "A_INJUNCTION" | "B_LAWSUIT";
  // Meta
  erstellDatum: Date;
};

const fmtDatum = (d: Date) => format(d, "d. MMMM yyyy", { locale: de });
const fmtDatumLang = (d: Date) =>
  format(d, "EEEE, 'den' d. MMMM yyyy", { locale: de });

export function generiereAbmahnung(data: AbmahnungData): string {
  const pl = PLATFORM_CONFIG[data.platform];
  const gerichtlicheMassnahme =
    data.track === "A_INJUNCTION"
      ? "den Erlass einer einstweiligen Verfügung"
      : "Klage auf Wiederherstellung und Schadensersatz";

  // Sachverhalt
  let sachverhalt: string;
  if (data.kontotyp === "GEWERBLICH") {
    sachverhalt = `Unser Mandant nutzt ${pl.name} gewerblich.`;
    if (data.gewerbBeschreibung)
      sachverhalt += ` ${data.gewerbBeschreibung}`;
    if (data.followerCount)
      sachverhalt += ` Das Konto verfügt über ca. ${data.followerCount} Follower bzw. Abonnenten.`;
    if (data.monatlicheEinnahmen)
      sachverhalt += ` Über die Plattform generiert unser Mandant monatliche Einnahmen in Höhe von ca. ${data.monatlicheEinnahmen}.`;
    if (data.vertraegeBetroffen)
      sachverhalt += ` Es bestehen aktive Werbe- und Kooperationsverträge, die durch die Sperrung unmittelbar gefährdet sind.`;
  } else {
    sachverhalt = `Unser Mandant nutzt ${pl.name} im privaten Rahmen zur persönlichen Meinungsäußerung und zum Austausch mit seiner Community.`;
  }

  sachverhalt += `\n\nAm ${fmtDatum(data.sperrDatum)} sperrten Sie das Konto unseres Mandanten unter Hinweis auf angebliche Verstöße gegen die Gemeinschaftsstandards (${data.sperrGrund}).`;
  if (data.sperrDetails) sachverhalt += ` ${data.sperrDetails}`;

  // Fazit
  let fazit = `Es ergibt sich Ihre Pflicht zur Gewährung der Nutzung der Plattform ${pl.name} nicht nur aus dem bestehenden Vertragsverhältnis, sondern zugleich aus der Verpflichtung zur Beachtung der deutschen Grundrechte sowie der Charta der Grundrechte der Europäischen Union.\n\n`;

  if (data.kontotyp === "GEWERBLICH") {
    fazit += `Für unseren Mandanten ist die uneingeschränkte Nutzung seines Kontos auf ${pl.name} von erheblicher Bedeutung.`;
    if (data.followerCount)
      fazit += ` Ihm folgen dort ca. ${data.followerCount} Menschen.`;
    fazit += ` Er nutzt diese Plattform nicht nur zur Entfaltung seiner Meinungsäußerung und seines allgemeinen Persönlichkeitsrechts, sondern vor allem auch zur Bewerbung seines Geschäftsbetriebs. Die Sperrung seines Accounts stellt einen unzulässigen Eingriff in sein allgemeines Persönlichkeitsrecht gemäß Art. 2 Abs. 1 i.V.m. Art. 1 Abs. 1 GG, in seine Meinungsfreiheit nach Art. 5 Abs. 1 GG sowie in seine Berufsausübungsfreiheit nach Art. 12 Abs. 1 GG dar. Jede Stunde, in der er sein Konto nicht nutzen kann, verursacht ihm erhebliche wirtschaftliche Nachteile. Es ist nicht hinnehmbar, diesen Zustand fortbestehen zu lassen.\n\nDies ist vor allem vor dem Hintergrund bemerkenswert, dass er sich nicht nur stets an die Gemeinschaftsstandards gehalten hat, sondern mit seinen Inhalten seit Jahren erheblich zur Reichweite, Attraktivität und positiven Wahrnehmung der Plattform beiträgt.`;
  } else {
    fazit += `Für unseren Mandanten ist die uneingeschränkte Nutzung seines Kontos auf ${pl.name} von erheblicher Bedeutung. Er nutzt die Plattform zur Entfaltung seiner Meinungsäußerung und seines allgemeinen Persönlichkeitsrechts. Die Sperrung seines Accounts stellt einen unzulässigen Eingriff in sein allgemeines Persönlichkeitsrecht gemäß Art. 2 Abs. 1 i.V.m. Art. 1 Abs. 1 GG sowie in seine Meinungsfreiheit nach Art. 5 Abs. 1 GG dar.`;
  }

  // DSA-Block (nur für VLOPs)
  const dsaBlock = pl.isVLOP
    ? `
3. Unionsrechtliche Pflichten

Für Sie als sogenannte Very Large Online Platform (VLOP) im Sinne des Digital Services Acts (DSA) – EU-Verordnung 2022/2065 des Europäischen Parlaments und des Rates vom 19. Oktober 2022 – ergibt sich aus Art. 14 Abs. 4 DSA insoweit eine unmittelbare Bindung an die Rechte aus der EU-Grundrechtecharta. Danach ist es Ihnen untersagt, Nutzer willkürlich zu sperren:

„Die Anbieter von Vermittlungsdiensten gehen bei der Anwendung und Durchsetzung der in Absatz 1 genannten Beschränkungen sorgfältig, objektiv und verhältnismäßig vor und berücksichtigen dabei die Rechte und berechtigten Interessen aller Beteiligten sowie die Grundrechte der Nutzer, die in der Charta verankert sind, etwa das Recht auf freie Meinungsäußerung, die Freiheit und den Pluralismus der Medien und andere Grundrechte und -freiheiten."

Weiterhin sind Sie nach Art. 17 Abs. 1 DSA verpflichtet, jegliche Art von Beschränkungen und Unterdrückungen von Inhalten zu begründen.`
    : "";

  // Gesamtes Schreiben
  return `A B M A H N U N G

${data.vorname} ${data.nachname} ./. ${pl.antragsgegner} – Unterlassungsaufforderung

Sehr geehrte Damen und Herren,

hiermit zeigen wir an, dass wir die rechtlichen Interessen des Herrn ${data.vorname} ${data.nachname}, ${data.strasse}, ${data.plz} ${data.stadt}, vertreten. Ordnungsgemäße Bevollmächtigung wird anwaltlich versichert. Wir weisen darauf hin, dass der Nachweis der schriftlichen Bevollmächtigung keine Wirksamkeitsvoraussetzung darstellt (BGH, Urteil vom 19. Mai 2010, I ZR 140/08).

Gegenstand unserer Beauftragung ist die unrechtmäßige Sperrung ${pl.bezeichnung} unseres Mandanten am ${fmtDatum(data.sperrDatum)}

- Nutzername: ${data.nutzername}
- Verknüpft mit E-Mail: ${data.registrierteEmail}

Mit diesem Schreiben fordern wir Sie außergerichtlich auf, die Sperre ${pl.bezeichnungGenitiv} unseres Mandanten sowie sämtliche damit verknüpfte Seiten unverzüglich aufzuheben und sie in einen Zustand ohne jegliche Einschränkungen zurückzusetzen.

Im Einzelnen:


I.
Sachverhalt

${sachverhalt}


II.
Zu den Pflichten der Betreiber sozialer Netzwerke

1. Vertragliche Pflichten

Zwischen unserem Mandanten und Ihnen besteht ein rechtsgeschäftliches Dauerschuldverhältnis, kraft dessen Sie gemäß §§ 311 Abs. 1, 241 Abs. 1 BGB verpflichtet sind, unserem Mandanten die Nutzung der Plattform ${pl.name} zu ermöglichen, solange er hierbei nicht gegen geltendes deutsches oder europäisches Recht oder Ihre Nutzungsbedingungen verstößt, wobei Ihre Nutzungsbedingungen nach dem Maßstab der AGB-Kontrolle (§§ 305 ff. BGB) nicht unangemessen benachteiligend gegenüber unserem Mandanten sein dürfen. Zu betonen ist hierbei, dass Sie auch im Rahmen der mittelbaren Grundrechtsdrittwirkung an verschiedene Grundrechte gebunden sind.

2. BGH-Rechtsprechung

Ihnen sind die Urteile des Bundesgerichtshofs vom 29. Juli 2021 (Az. III ZR 179/20 und III ZR 192/20) bekannt, in denen klargestellt wurde, dass es Plattformbetreibern verwehrt ist, Nutzerkonten ohne sachlichen Grund und damit willkürlich zu löschen sowie dass ein vorheriges Anhörungsverfahren durchzuführen ist. Eine vertiefte Auseinandersetzung mit dieser Rechtsprechung erübrigt sich daher an dieser Stelle.
${dsaBlock}


III.
Fazit

${fazit}


Wir fordern Sie namens und im Auftrag unseres Mandanten auf, unverzüglich, spätestens bis

${fmtDatumLang(data.fristDatum)}, 12:00 Uhr (UTC+1)

das Nutzerkonto unseres Mandanten zu entsperren und den Zustand wiederherzustellen, der vor Löschung bzw. Sperre am ${fmtDatum(data.sperrDatum)} bestand.

Weil Sie unserem Mandanten gegenüber nicht nur zur Beseitigung, sondern auch zur (künftigen) Unterlassung verpflichtet sind, haben wir Sie namens und im Auftrag unseres Mandanten ebenso aufzufordern, unverzüglich, jedoch spätestens bis

${fmtDatumLang(data.fristDatum)}, 12:00 Uhr (UTC+1)

sich im Wege einer hinreichend bestimmten und strafbewehrten Unterlassungserklärung rechtsverbindlich dazu zu verpflichten, künftige Rechtsverletzungen zu unterlassen, um die hier bestehende Wiederholungsgefahr auszuräumen.

Vorsichtshalber weisen wir darauf hin, dass der Zugang der Unterlassungserklärung vorab per E-Mail oder Telefax nur dann fristwahrend ist, wenn uns das Original anschließend zeitnah auf postalischem Wege zugeht.

Die Fristen sind auch angemessen, da Sie unlängst über die Hintergründe informiert wurden.

Im Falle des fruchtlosen Ablaufs der vorgenannten Fristen werden wir unmittelbar und ohne weitere Ankündigung gerichtliche Hilfe in Anspruch nehmen und ${gerichtlicheMassnahme} gegen Sie beantragen.

Nehmen Sie zur Kenntnis, dass sich unser Mandant in jedem Falle die Geltendmachung von materiellem und immateriellem Schadensersatz gegen Sie vorbehält.


Mit freundlichen Grüßen

[Kanzlei-Unterschrift]
Rechtsanwalt / Rechtsanwältin
DR. SARAFI Rechtsanwaltsgesellschaft mbH`;
}

export type { AbmahnungData };
