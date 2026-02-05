"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();
  const isHomepage = pathname === "/";

  return (
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

        {isHomepage ? (
          <div className="flex items-center gap-3">
            <Link
              href="/mein-fall"
              className="btn-outline text-accent text-[15px] font-semibold px-7 py-3 rounded-lg border-2 border-accent bg-transparent hover:bg-accent/5 transition-colors no-underline"
            >
              Mein Fall
            </Link>
            <Link
              href="/start"
              className="btn-shine bg-accent text-white text-[15px] font-semibold px-7 py-3 rounded-lg no-underline"
            >
              Fall starten →
            </Link>
          </div>
        ) : (
          <Link
            href="/"
            className="btn-shine bg-accent text-white text-[15px] font-semibold px-7 py-3 rounded-lg no-underline"
          >
            ← Zurück
          </Link>
        )}
      </div>
    </nav>
  );
}
