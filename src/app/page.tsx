import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { FaInstagram, FaFacebook, FaTiktok, FaYoutube, FaTwitch } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const PLATFORMS = [
  { name: "Instagram", color: "#E4405F", icon: FaInstagram },
  { name: "TikTok", color: "#000000", icon: FaTiktok },
  { name: "X", color: "#000000", icon: FaXTwitter },
  { name: "Kick", color: "#53FC18", icon: null },
  { name: "Twitch", color: "#9146FF", icon: FaTwitch },
  { name: "Facebook", color: "#1877F2", icon: FaFacebook },
  { name: "YouTube", color: "#FF0000", icon: FaYoutube },
];

const TESTIMONIALS = [
  {
    quote: "Mein Instagram-Account wurde ohne Vorwarnung gesperrt. DR. SARAFI hat die Entsperrung schnell und professionell erreicht.",
    name: "Jaden Bojsen",
    role: "DJ",
    platform: "Instagram",
  },
  {
    quote: "Nach der Sperrung meines Instagram-Kontos hieß es von Meta, dass man mir meinen Account mit fast 1,5 Mio Follower nicht mehr freischalten wird. DR. SARAFI hat sofort gehandelt und Meta vor Gericht gezerrt. Mein Account wurde wiederhergestellt.",
    name: "Azet",
    role: "Rapper",
    platform: "Instagram",
  },
  {
    quote: "Twitch hat sich auf US-Recht berufen und jede Kommunikation verweigert. DR. SARAFI hat trotzdem vor dem Landgericht gewonnen. Twitch ging in Berufung, auch hier haben wir vor dem Oberlandesgericht gewonnen.",
    name: "KuchenTV",
    role: "Influencer",
    platform: "Twitch",
  },
  {
    quote: "Mein TikTok-Konto war weg. Dank DR. SARAFI habe ich es zurückbekommen.",
    name: "Scurrows",
    role: "Streamer",
    platform: "TikTok",
  },
  {
    quote: "Obwohl sich Twitch auf kalifornisches Recht und Schiedsgerichtsklauseln berufen hat, konnte DR. SARAFI die Entsperrung gerichtlich durchsetzen.",
    name: "Orangemorange",
    role: "Streamer",
    platform: "Twitch",
  },
  {
    quote: "Kick-Account war plötzlich verschwunden. DR. SARAFI hat es innerhalb von einigen Stunden zurückgeholt.",
    name: "Fler",
    role: "Rapper",
    platform: "Kick",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Nav />

      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-6 pt-28 pb-24">
        <h1 className="font-serif text-[clamp(32px,5vw,52px)] font-bold leading-[1.15] tracking-tight text-center mb-5">
          Social-Media-Konto gesperrt?
        </h1>
        <p className="text-lg text-muted leading-relaxed text-center max-w-[600px] mb-10">
          Wir helfen Ihnen gegenüber Instagram, Facebook, TikTok, YouTube, X,
          Twitch und Kick.
        </p>
        <Link
          href="/start"
          className="btn-shine inline-block bg-accent text-white text-[15px] font-semibold px-8 py-3.5 rounded-lg no-underline"
        >
          Anfrage stellen
        </Link>
      </section>

      {/* Sektion 1: Kanzlei-Vorstellung */}
      <section className="bg-[#F5F5F3] py-20">
        <div className="max-w-[700px] mx-auto px-6 text-center">
          <h2 className="font-serif text-[clamp(24px,3.5vw,32px)] font-bold leading-tight tracking-tight mb-6">
            DR. SARAFI Rechtsanwaltsgesellschaft mbH
          </h2>
          <p className="text-[16px] text-muted leading-[1.75]">
            Unsere Kanzlei ist die erste in Deutschland, die Twitch gerichtlich
            zur Entsperrung eines Accounts zwingen konnte – obwohl sich die
            Plattform auf US-kalifornisches Recht sowie Schlichtungs- und
            Schiedsgerichtsklauseln berief und damit zuvor andere gerichtliche
            Verfahren für sich entscheiden konnte.
          </p>
        </div>
      </section>

      {/* Sektion 2: Erfolge */}
      <section className="bg-background py-20">
        <div className="max-w-[700px] mx-auto px-6 text-center">
          <h2 className="font-serif text-[clamp(24px,3.5vw,32px)] font-bold leading-tight tracking-tight mb-10">
            Erfolgreiche Entsperrungen
          </h2>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {PLATFORMS.map((platform) => {
              const Icon = platform.icon;
              return (
                <div
                  key={platform.name}
                  className="flex items-center gap-2.5 px-5 py-2.5 bg-subtle border border-border rounded-lg"
                >
                  {platform.name === "Kick" ? (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{ backgroundColor: "#000000", color: platform.color }}
                    >
                      K
                    </div>
                  ) : Icon ? (
                    <Icon size={18} color={platform.color} />
                  ) : null}
                  <span className="text-[15px] font-medium text-foreground">
                    {platform.name}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-[16px] text-muted leading-relaxed">
            Wir haben bereits zahlreiche Accounts auf diesen Plattformen
            erfolgreich entsperrt.
          </p>
        </div>
      </section>

      {/* Sektion 3: Testimonials */}
      <section className="bg-[#F0EFEB] py-20">
        <div className="max-w-[1000px] mx-auto px-6">
          <h2 className="font-serif text-[clamp(24px,3.5vw,32px)] font-bold leading-tight tracking-tight text-center mb-12">
            Das sagen unsere Mandanten
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {TESTIMONIALS.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white border border-border rounded-xl p-6 flex flex-col"
              >
                <p className="text-[15px] text-foreground leading-relaxed flex-1 mb-5">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[14px] font-semibold text-foreground">
                      {testimonial.name}
                    </p>
                    <p className="text-[13px] text-muted">
                      {testimonial.role}
                    </p>
                  </div>
                  <span className="text-[12px] font-medium text-muted bg-subtle px-2.5 py-1 rounded">
                    {testimonial.platform}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[15px] text-muted text-center mt-8">
            ...und zahlreiche weitere erfolgreiche Entsperrungen.
          </p>
        </div>
      </section>

      {/* Sektion 4: Warum schnell handeln */}
      <section className="bg-background py-20">
        <div className="max-w-[700px] mx-auto px-6 text-center">
          <h2 className="font-serif text-[clamp(24px,3.5vw,32px)] font-bold leading-tight tracking-tight mb-6">
            Warum schnelles Handeln wichtig ist
          </h2>
          <p className="text-[16px] text-muted leading-[1.75] mb-10">
            Für eine einstweilige Verfügung gilt eine Monatsfrist ab Sperrung.
            Je früher Sie handeln, desto mehr rechtliche Optionen stehen Ihnen
            zur Verfügung.
          </p>
          <Link
            href="/start"
            className="btn-shine inline-block bg-accent text-white text-[15px] font-semibold px-8 py-3.5 rounded-lg no-underline"
          >
            Jetzt Anfrage stellen
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
