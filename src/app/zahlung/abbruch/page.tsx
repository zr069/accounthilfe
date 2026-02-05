import Link from "next/link";
import DevoryCredit from "@/components/DevoryCredit";

export default function ZahlungAbbruchPage() {
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
          <div className="w-14 h-14 rounded-full bg-amber-light flex items-center justify-center mx-auto mb-4 text-2xl">
            ↩
          </div>
          <h1 className="font-serif text-2xl font-bold mb-2">
            Zahlung abgebrochen
          </h1>
          <p className="text-muted mb-6 leading-relaxed">
            Die Zahlung wurde nicht abgeschlossen. Ihr Fall wurde noch nicht angelegt.
            <br />
            Sie können den Vorgang jederzeit erneut starten.
          </p>

          <div className="flex flex-col gap-3">
            <Link
              href="/start"
              className="btn-shine inline-block bg-accent text-white text-[15px] font-semibold px-8 py-3.5 rounded-lg no-underline"
            >
              Zurück zum Wizard
            </Link>
            <Link
              href="/"
              className="inline-block text-muted text-[15px] hover:text-foreground transition-colors no-underline"
            >
              Zur Startseite
            </Link>
          </div>
        </div>

        <div className="p-4 rounded-[10px] border border-border bg-subtle mt-6">
          <p className="text-sm text-muted leading-relaxed">
            <strong>Hinweis:</strong> Ihre eingegebenen Daten wurden im Browser zwischengespeichert.
            Wenn Sie den Wizard erneut aufrufen, können Sie dort fortfahren, wo Sie aufgehört haben.
          </p>
        </div>
        <DevoryCredit />
      </div>
    </div>
  );
}
