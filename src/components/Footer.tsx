import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border py-6">
      <div className="max-w-[960px] mx-auto px-6 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-accent text-white flex items-center justify-center font-serif text-base font-bold">
                §
              </div>
              <span className="font-serif text-[17px] font-bold">
                AccountHilfe.de
              </span>
            </div>
            <span className="text-faint text-[12px] ml-[42px]">
              Ein Angebot der DR. SARAFI Rechtsanwaltsgesellschaft mbH
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/impressum" className="text-faint text-[13px] hover:text-muted no-underline">
              Impressum
            </Link>
            <Link href="/datenschutz" className="text-faint text-[13px] hover:text-muted no-underline">
              Datenschutz
            </Link>
          </div>
        </div>
        <div className="text-center text-[11px] text-faint/70">
          Website made with <span style={{ color: "#C8102E" }}>♥</span> by{" "}
          <a
            href="https://www.devory.it"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-muted no-underline"
          >
            DEVORY.IT
          </a>
        </div>
      </div>
    </footer>
  );
}
