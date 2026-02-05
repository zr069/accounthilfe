import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <div className="max-w-[720px] mx-auto px-6 py-16">
        <h1 className="font-serif text-3xl font-bold mb-8">Impressum</h1>
        <div className="prose prose-sm max-w-none text-foreground leading-relaxed">
          <h2 className="font-serif text-xl font-bold mt-6 mb-3">Angaben gemäß § 5 DDG</h2>
          <p>
            DR. SARAFI Rechtsanwaltsgesellschaft mbH<br />
            Leerbachstraße 54<br />
            60322 Frankfurt am Main
          </p>

          <h2 className="font-serif text-xl font-bold mt-6 mb-3">Kontakt</h2>
          <p>
            E-Mail: info@sarafi.de
          </p>

          <h2 className="font-serif text-xl font-bold mt-6 mb-3">Vertretungsberechtigter Geschäftsführer</h2>
          <p>Rechtsanwalt Dr. Nik Sarafi</p>

          <h2 className="font-serif text-xl font-bold mt-6 mb-3">Registereintrag</h2>
          <p>
            Sitz der Gesellschaft: Frankfurt am Main<br />
            Eingetragen im Handelsregister: Amtsgericht Frankfurt am Main, HRB 131781<br />
            USt-ID-Nr.: DE326113355
          </p>

          <h2 className="font-serif text-xl font-bold mt-6 mb-3">Zuständige Rechtsanwaltskammer</h2>
          <p>
            Rechtsanwaltskammer für den OLG-Bezirk Frankfurt a.M.<br />
            Bockenheimer Anlage 36, 60322 Frankfurt a.M.<br />
            Tel.: +49 (0) 69 17009801<br />
            Fax: +49 (0) 69 17009850<br />
            E-Mail: info@rak-ffm.de<br />
            Web: www.rak-ffm.de
          </p>

          <h2 className="font-serif text-xl font-bold mt-6 mb-3">Berufsrechtliche Regelungen</h2>
          <p>
            Berufsbezeichnung: Rechtsanwalt (verliehen in der Bundesrepublik Deutschland)<br />
            Es gelten die berufsrechtlichen Regelungen: BRAO, BORA, FAO, RVG, CCBE – abrufbar auf brak.de
          </p>

          <h2 className="font-serif text-xl font-bold mt-6 mb-3">Berufshaftpflichtversicherung</h2>
          <p>
            Allianz Versicherungs-AG<br />
            Königinstraße 28, 80802 München<br />
            Versicherungssumme: 2.500.000 €<br />
            Geltungsbereich: weltweit
          </p>

          <h2 className="font-serif text-xl font-bold mt-6 mb-3">Vermeidung von Interessenkonflikten</h2>
          <p>
            Prüfung vor Mandatsannahme gemäß § 43a Abs. 4 BRAO.
          </p>

          <h2 className="font-serif text-xl font-bold mt-6 mb-3">Streitschlichtung</h2>
          <p>
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit.
            Unsere E-Mail-Adresse finden Sie oben im Impressum. Wir sind nicht bereit oder verpflichtet,
            an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
          </p>

          <h2 className="font-serif text-xl font-bold mt-6 mb-3">Webdesign & Entwicklung</h2>
          <p>
            <a
              href="https://www.devory.it"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              DEVORY.IT
            </a>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
