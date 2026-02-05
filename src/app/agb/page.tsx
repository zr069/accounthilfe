import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function AGBPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <div className="max-w-[720px] mx-auto px-6 py-16">
        <h1 className="font-serif text-3xl font-bold mb-8">Allgemeine Geschäftsbedingungen</h1>
        <div className="prose prose-sm max-w-none text-foreground leading-relaxed">
          <h2 className="font-serif text-xl font-bold mt-6 mb-3">§ 1 Geltungsbereich</h2>
          <p>
            Diese Allgemeinen Geschäftsbedingungen gelten für alle Mandatsverhältnisse zwischen der
            DR. SARAFI Rechtsanwaltsgesellschaft mbH (nachfolgend „Kanzlei") und dem Mandanten,
            die über das Portal accounthilfe.de begründet werden.
          </p>

          <h2 className="font-serif text-xl font-bold mt-6 mb-3">§ 2 Vertragsgegenstand</h2>
          <p>
            Die Kanzlei bietet über das Portal die automatisierte Erstellung anwaltlicher Abmahnschreiben
            zur Entsperrung von Social-Media-Konten an. Der Leistungsumfang umfasst die außergerichtliche
            Geltendmachung des Entsperrungsanspruchs und – bei Bedarf – die gerichtliche Durchsetzung.
          </p>

          <h2 className="font-serif text-xl font-bold mt-6 mb-3">§ 3 Zustandekommen des Mandatsverhältnisses</h2>
          <p>
            Das Mandatsverhältnis kommt durch die vollständige Eingabe der erforderlichen Daten im Portal
            und die Erteilung der elektronischen Vollmacht zustande. Der Mandant bestätigt die Richtigkeit
            seiner Angaben.
          </p>

          <h2 className="font-serif text-xl font-bold mt-6 mb-3">§ 4 Vergütung</h2>
          <p>
            Die Vergütung richtet sich nach dem Rechtsanwaltsvergütungsgesetz (RVG) und der individuellen
            Vergütungsvereinbarung, die der Mandant im Rahmen der Mandatierung akzeptiert.
          </p>

          <h2 className="font-serif text-xl font-bold mt-6 mb-3">§ 5 Haftung</h2>
          <p>
            Die Haftung der Kanzlei richtet sich nach den gesetzlichen Bestimmungen. Die Haftung ist
            auf die Mindestversicherungssumme der Berufshaftpflichtversicherung beschränkt, soweit
            kein vorsätzliches oder grob fahrlässiges Handeln vorliegt.
          </p>

          <h2 className="font-serif text-xl font-bold mt-6 mb-3">§ 6 Schlussbestimmungen</h2>
          <p>
            Es gilt deutsches Recht. Gerichtsstand ist Frankfurt am Main, soweit gesetzlich zulässig.
            Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt die Wirksamkeit
            der übrigen Bestimmungen unberührt.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
