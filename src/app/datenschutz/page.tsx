import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <div className="max-w-[720px] mx-auto px-6 py-16">
        <h1 className="font-serif text-3xl font-bold mb-4">Datenschutzerklärung</h1>
        <p className="text-foreground leading-relaxed mb-8">
          Der Schutz Ihrer personenbezogenen Daten ist uns ein besonders wichtiges und hohes Anliegen.
          Mit der nachfolgenden Datenschutzerklärung versuchen wir Ihnen in verständlicher Art und Weise
          unsere Datenschutzbestimmungen zu erläutern und Sie vor allem über Ihre Rechte als betroffene
          Person aufzuklären.
        </p>

        <div className="prose prose-sm max-w-none text-foreground leading-relaxed">
          {/* I. Verantwortlicher */}
          <h2 className="font-serif text-xl font-bold mt-8 mb-3">I. Verantwortlicher gemäß Art.&nbsp;4 Nr.&nbsp;7 DSGVO</h2>
          <p>
            Für die Verarbeitung personenbezogener Daten im Sinne der Europäischen
            Datenschutz-Grundverordnung (nachfolgend: DSGVO) sowie anderer nationaler
            Datenschutzgesetze sowie -bestimmungen ist die
          </p>
          <p>
            DR. SARAFI Rechtsanwaltsgesellschaft mbH<br />
            Leerbachstraße 54<br />
            60322 Frankfurt am Main<br />
            E-Mail: info@sarafi.de
          </p>

          {/* II. Begrifflichkeiten */}
          <h2 className="font-serif text-xl font-bold mt-8 mb-3">II. Begrifflichkeiten</h2>
          <p>
            Für die Definition der nachfolgenden Begriffe „Datenverarbeitung",
            „Verarbeitung", „Verarbeitung von Daten" werden die Definitionen der
            Art.&nbsp;4 DSGVO zugrunde gelegt.
          </p>

          {/* III. Datenverarbeitung im Allgemeinen */}
          <h2 className="font-serif text-xl font-bold mt-8 mb-3">III. Datenverarbeitung im Allgemeinen</h2>

          <h3 className="font-serif text-base font-bold mt-5 mb-2">1. Umfang der Datenverarbeitung</h3>
          <p>
            Die Verarbeitung personenbezogener Daten erfolgt grundsätzlich nur, um die Bereitstellung
            einer funktionsfähigen Internetseite, die Darstellung der Inhalte sowie die Erbringung
            unserer anwaltlichen Leistungen – insbesondere die Durchsetzung der Entsperrung gesperrter
            Social-Media-Konten – zu ermöglichen. Die Datenverarbeitung erfolgt in der Regel nur nach
            der Einholung einer Einwilligung des Nutzers. Keine Einwilligung wird eingeholt, wenn dies
            aus tatsächlichen Gründen nicht möglich ist und/oder die Verarbeitung der Daten durch
            gesetzliche Vorschriften gestattet und somit auch ohne eine vorherige Einwilligung des
            betroffenen Nutzers rechtmäßig ist.
          </p>

          <h3 className="font-serif text-base font-bold mt-5 mb-2">2. Rechtsgrundlagen der Verarbeitung personenbezogener Daten</h3>
          <p>
            Wenn wir eine Einwilligung des betroffenen Nutzers eingeholt haben, stellt
            Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;a DSGVO die Rechtsgrundlage dar. Sofern für
            vorvertragliche Maßnahmen oder zur Erfüllung eines Vertrages personenbezogene Daten
            verarbeitet werden müssen, stellt Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;b DSGVO die
            Rechtsgrundlage dar. Wenn die Verarbeitung zur Erfüllung rechtlicher Verpflichtungen
            erforderlich ist, stellt Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;c DSGVO die Rechtsgrundlage
            dar. Ist die Verarbeitung zur Wahrung eines berechtigten Interesses erforderlich und
            überwiegen nicht die Interessen der betroffenen Person, so stellt
            Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;f DSGVO die Rechtsgrundlage dar.
          </p>

          <h3 className="font-serif text-base font-bold mt-5 mb-2">3. Datenlöschung und Speicherdauer</h3>
          <p>
            Personenbezogene Daten werden gelöscht, sobald der Speicherungszweck entfällt.
            Darüber hinaus kann eine Speicherung erfolgen, sofern wir hierzu gesetzlich
            verpflichtet sind.
          </p>

          {/* IV. Besonderheiten bei Bereitstellung der Internetseite */}
          <h2 className="font-serif text-xl font-bold mt-8 mb-3">IV. Besonderheiten bei der Bereitstellung dieser Internetseite</h2>

          <h3 className="font-serif text-base font-bold mt-5 mb-2">1. Server-Logfiles</h3>
          <p>
            Beim Aufruf unserer Internetseite erfasst unser System automatisiert Informationen
            vom Computersystem des aufrufenden Rechners. Bei uns werden nur anonymisierte
            IP-Adressen gespeichert (letztes Oktett durch Zufallswert ersetzt). Die Herstellung
            eines Personenbezuges ist nicht mehr möglich. Die vorübergehende Speicherung ist
            notwendig für die Auslieferung der Website. Backups werden 14 Tage in verschlüsselter
            Form aufbewahrt. Rechtsgrundlage: Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;f DSGVO.
          </p>

          <h3 className="font-serif text-base font-bold mt-5 mb-2">2. Cookies</h3>
          <p>
            Unsere Website setzt folgende Cookies ein: Session-Cookie (Authentifizierung) – dient
            der Zuordnung des angemeldeten Nutzers zu seiner Sitzung im Mandantenportal. Ohne dieses
            Cookie ist ein Login und die Nutzung des Mandanten-Dashboards nicht möglich. Wird nach
            Beendigung der Sitzung gelöscht. Keine Cookies zu Werbezwecken. Rechtsgrundlage:
            Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;f DSGVO.
          </p>

          <h3 className="font-serif text-base font-bold mt-5 mb-2">3. Google Webfonts</h3>
          <p>
            Diese Seite nutzt zur einheitlichen Darstellung von Schriftarten Web Fonts von Google
            (Libre Baskerville, Source Sans 3). Beim Aufruf lädt Ihr Browser die Fonts von
            Google-Servern. Hierdurch erlangt Google Kenntnis darüber, dass über Ihre IP-Adresse
            unsere Website aufgerufen wurde. Rechtsgrundlage: Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;f DSGVO.
            Weitere Informationen:{" "}
            <a href="https://developers.google.com/fonts/faq" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">
              https://developers.google.com/fonts/faq
            </a>{" "}
            und{" "}
            <a href="https://www.google.com/policies/privacy/" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">
              https://www.google.com/policies/privacy/
            </a>
          </p>

          {/* V. Datenverarbeitung im Mandantenportal */}
          <h2 className="font-serif text-xl font-bold mt-8 mb-3">V. Datenverarbeitung im Rahmen des Mandantenportals</h2>
          <p>
            Über unser Online-Portal können Sie uns mit der außergerichtlichen und ggf. gerichtlichen
            Durchsetzung der Entsperrung Ihres Social-Media-Kontos beauftragen. Dabei werden
            personenbezogene Daten erhoben, die für die Begründung, Durchführung und Abwicklung des
            Mandatsverhältnisses erforderlich sind.
          </p>

          <h3 className="font-serif text-base font-bold mt-5 mb-2">1. Erhobene Daten im Mandatsformular</h3>
          <p>
            Im Rahmen des mehrstufigen Online-Formulars werden folgende Daten erhoben:
          </p>
          <p>
            <strong>Schritt 1 – Vorprüfung:</strong> Wohnsitz in Deutschland (Ja/Nein), Datum der Kontosperrung.
          </p>
          <p>
            <strong>Schritt 2 – Falldaten:</strong> Betroffene Plattform (Instagram, Facebook, TikTok, YouTube,
            X, Twitch, Kick), Nutzername/Profilname, bei der Plattform registrierte E-Mail-Adresse, Grund
            der Sperrung (Auswahl und ggf. Freitext), detaillierte Schilderung des Sachverhalts (Freitext),
            Screenshots und Dokumente zur Sperrung (Datei-Upload).
          </p>
          <p>
            <strong>Schritt 3 – Kontotyp:</strong> Art der Kontonutzung (privat oder gewerblich). Bei gewerblicher
            Nutzung zusätzlich: Beschreibung der gewerblichen Tätigkeit, Followerzahl, geschätzte monatliche
            Einnahmen (optional), Angabe ob Werbe-/Kooperationsverträge betroffen sind.
          </p>
          <p>
            <strong>Schritt 4 – Persönliche Daten:</strong> Vorname und Nachname, Anschrift (Straße, Hausnummer,
            PLZ, Stadt), E-Mail-Adresse (Kontakt), Telefonnummer (optional).
          </p>
          <p>
            <strong>Schritt 5 – Mandatierung:</strong> Erteilung der anwaltlichen Vollmacht (Checkbox), Zustimmung
            zur Vergütungsvereinbarung (Checkbox), Einwilligung in die Datenschutzerklärung (Checkbox).
          </p>

          <h3 className="font-serif text-base font-bold mt-5 mb-2">2. Zweck der Datenverarbeitung</h3>
          <p>Die Erhebung und Verarbeitung ist erforderlich für:</p>
          <ul className="list-disc pl-6 my-2">
            <li>Prüfung der Erfolgsaussichten (insbesondere Berechnung der Monatsfrist für einstweilige Verfügung)</li>
            <li>Erstellung und Versand des anwaltlichen Abmahnschreibens</li>
            <li>Identifizierung des Kontos gegenüber dem Plattformbetreiber</li>
            <li>Berechnung und Überwachung der Frist</li>
            <li>Vorbereitung gerichtlicher Schritte bei fruchtlosem Fristablauf</li>
            <li>Kommunikation mit Ihnen im Rahmen des Mandats</li>
          </ul>

          <h3 className="font-serif text-base font-bold mt-5 mb-2">3. Rechtsgrundlage</h3>
          <p>
            Die Rechtsgrundlage für die Verarbeitung der im Mandatsformular erhobenen personenbezogenen
            Daten ist Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;b DSGVO. Die Datenverarbeitung ist für die
            Begründung und Durchführung des Mandatsverhältnisses erforderlich. Soweit die Verarbeitung
            darüber hinaus zur Erfüllung berufsrechtlicher Pflichten erforderlich ist (z.B.
            Aufbewahrungspflichten nach §&nbsp;50 BRAO), stellt Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;c DSGVO
            die Rechtsgrundlage dar.
          </p>

          <h3 className="font-serif text-base font-bold mt-5 mb-2">4. Weitergabe an Dritte</h3>
          <p>
            Die Daten werden – soweit für die Mandatsdurchführung erforderlich – weitergegeben an:
            Plattformbetreiber (im Abmahnschreiben: Name, Anschrift, Nutzername, registrierte E-Mail)
            und Gerichte (bei einstweiliger Verfügung oder Klage). Eine darüber hinausgehende Weitergabe
            findet nicht statt.
          </p>

          <h3 className="font-serif text-base font-bold mt-5 mb-2">5. Datei-Uploads</h3>
          <p>
            Screenshots und Dokumente werden verschlüsselt auf unseren Servern gespeichert und
            ausschließlich zur Sachverhaltsrekonstruktion und Glaubhaftmachung im Rahmen Ihres
            Mandats verwendet. Rechtsgrundlage: Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;b DSGVO.
          </p>

          <h3 className="font-serif text-base font-bold mt-5 mb-2">6. Speicherdauer der Mandatsdaten</h3>
          <p>
            Die Daten werden für die Dauer des Mandatsverhältnisses gespeichert. Nach Beendigung
            gemäß den berufsrechtlichen Aufbewahrungspflichten (§&nbsp;50 BRAO) für sechs Jahre
            aufbewahrt, sofern nicht im Einzelfall längere Fristen bestehen. Danach Löschung.
          </p>

          {/* VI. Authentifizierung und Dashboard */}
          <h2 className="font-serif text-xl font-bold mt-8 mb-3">VI. Authentifizierung und Mandanten-Dashboard</h2>

          <h3 className="font-serif text-base font-bold mt-5 mb-2">1. Nutzerkonten</h3>
          <p>
            Zur Nutzung des Mandanten-Dashboards wird ein Nutzerkonto angelegt. Hierfür werden
            E-Mail-Adresse und Name gespeichert. Die Authentifizierung erfolgt über einen per E-Mail
            zugesandten Anmeldelink (Magic Link). Rechtsgrundlage: Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;b DSGVO.
          </p>

          <h3 className="font-serif text-base font-bold mt-5 mb-2">2. Fristüberwachung und E-Mail-Benachrichtigungen</h3>
          <p>
            Im Rahmen der anwaltlichen Fristüberwachung senden wir automatisierte
            E-Mail-Benachrichtigungen:
          </p>
          <ul className="list-disc pl-6 my-2">
            <li>3 Tage vor Fristablauf</li>
            <li>1 Tag vor Fristablauf</li>
            <li>Bei Fristablauf mit Information über nächste Schritte</li>
            <li>Bei erfolgreicher Entsperrung</li>
          </ul>
          <p>
            Versand an die im Mandatsformular angegebene Kontakt-E-Mail-Adresse. Rechtsgrundlage:
            Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;b DSGVO.
          </p>

          {/* VII. Hosting */}
          <h2 className="font-serif text-xl font-bold mt-8 mb-3">VII. Hosting und technische Infrastruktur</h2>
          <p>
            Die Internetseite und das Mandantenportal werden auf Servern in der Europäischen Union
            gehostet. Datenbank: PostgreSQL (gehostet in der EU). E-Mail-Versand: Resend (transaktionale
            E-Mails im Rahmen der Fristüberwachung). Eine Übermittlung personenbezogener Daten in
            Drittstaaten findet – mit Ausnahme der unter IV.3 genannten Google Webfonts – nicht statt.
          </p>

          {/* VIII. Ihre Rechte */}
          <h2 className="font-serif text-xl font-bold mt-8 mb-3">VIII. Ihre Rechte</h2>

          <h3 className="font-serif text-base font-bold mt-5 mb-2">1. Auskunftsrecht (Art.&nbsp;15 DSGVO)</h3>
          <p>
            Sie haben Anspruch auf Auskunft über die von Ihnen verarbeiteten personenbezogenen Daten.
          </p>

          <h3 className="font-serif text-base font-bold mt-5 mb-2">2. Recht auf Berichtigung (Art.&nbsp;16 DSGVO)</h3>
          <p>
            Sie haben einen Berichtigungs- und Vervollständigungsanspruch bei unrichtigen oder
            unvollständigen Daten.
          </p>

          <h3 className="font-serif text-base font-bold mt-5 mb-2">3. Recht auf Löschung (Art.&nbsp;17 DSGVO)</h3>
          <p>
            Sie haben das Recht auf Löschung Ihrer Daten, sofern einer der in Art.&nbsp;17 DSGVO
            genannten Gründe zutrifft. Das Recht besteht nicht, soweit die Verarbeitung gemäß
            Art.&nbsp;17 Abs.&nbsp;3 DSGVO erforderlich ist.
          </p>

          <h3 className="font-serif text-base font-bold mt-5 mb-2">4. Recht auf Einschränkung der Verarbeitung (Art.&nbsp;18 DSGVO)</h3>
          <p>
            Sie haben das Recht auf Einschränkung der Verarbeitung unter den Voraussetzungen des
            Art.&nbsp;18 DSGVO.
          </p>

          <h3 className="font-serif text-base font-bold mt-5 mb-2">5. Recht auf Datenübertragbarkeit (Art.&nbsp;20 DSGVO)</h3>
          <p>
            Sie haben das Recht, Ihre Daten in einem strukturierten, gängigen und maschinenlesbaren
            Format zu erhalten.
          </p>

          <h3 className="font-serif text-base font-bold mt-5 mb-2">6. Widerspruchsrecht (Art.&nbsp;21 DSGVO)</h3>
          <p>
            Sie haben das Recht, jederzeit gegen die Verarbeitung Ihrer Daten aufgrund von
            Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;e oder f DSGVO Widerspruch einzulegen.
          </p>

          <h3 className="font-serif text-base font-bold mt-5 mb-2">7. Recht auf Widerruf der Einwilligung</h3>
          <p>
            Sie haben das Recht, Ihre datenschutzrechtliche Einwilligungserklärung jederzeit zu
            widerrufen. Die Rechtmäßigkeit der bis zum Widerruf erfolgten Verarbeitung wird
            hierdurch nicht berührt.
          </p>

          <h3 className="font-serif text-base font-bold mt-5 mb-2">8. Automatisierte Entscheidung im Einzelfall (Art.&nbsp;22 DSGVO)</h3>
          <p>
            Sie haben das Recht, nicht einer ausschließlich auf automatisierter Verarbeitung
            beruhenden Entscheidung unterworfen zu werden. Hinweis: Unser Portal berechnet
            automatisiert, ob eine einstweilige Verfügung noch möglich ist (Track&nbsp;A) oder
            nur eine ordentliche Klage in Betracht kommt (Track&nbsp;B). Diese Berechnung stellt
            keine rechtlich bindende Entscheidung dar, sondern dient der Vorprüfung und wird stets
            durch einen Rechtsanwalt überprüft.
          </p>

          <h3 className="font-serif text-base font-bold mt-5 mb-2">9. Recht auf Beschwerde bei einer Aufsichtsbehörde</h3>
          <p>Zuständige Aufsichtsbehörde:</p>
          <p>
            Der Hessische Beauftragte für Datenschutz und Informationsfreiheit<br />
            Postfach 3163<br />
            65021 Wiesbaden<br />
            Tel.: +49 611 1408-0<br />
            E-Mail: poststelle@datenschutz.hessen.de<br />
            Web:{" "}
            <a href="https://datenschutz.hessen.de" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">
              https://datenschutz.hessen.de
            </a>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
