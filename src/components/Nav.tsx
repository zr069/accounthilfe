"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Nav() {
  const pathname = usePathname();
  const isHomepage = pathname === "/";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-background/92 backdrop-blur-md border-b border-border">
        <div className="max-w-[960px] mx-auto px-6 py-3.5 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-8 h-8 rounded-md bg-accent text-white flex items-center justify-center font-serif text-base font-bold">
              §
            </div>
            <span className="font-serif text-[17px] font-bold text-foreground">
              AccountHilfe.de
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3">
            {isHomepage ? (
              <>
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
              </>
            ) : (
              <Link
                href="/"
                className="btn-shine bg-accent text-white text-[15px] font-semibold px-7 py-3 rounded-lg no-underline"
              >
                ← Zurück
              </Link>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5"
            aria-label="Menü öffnen"
          >
            <span
              className={`block w-6 h-0.5 bg-foreground transition-all duration-300 ${
                mobileMenuOpen ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-foreground transition-all duration-300 ${
                mobileMenuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-foreground transition-all duration-300 ${
                mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Menu Slide-in */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-background z-50 md:hidden transform transition-transform duration-300 ease-out shadow-xl ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Close Button */}
        <div className="flex justify-end p-4">
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="w-10 h-10 flex items-center justify-center text-foreground"
            aria-label="Menü schließen"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Menu Links */}
        <div className="flex flex-col px-6 py-4 gap-2">
          <Link
            href="/start"
            className="text-[17px] font-semibold text-white bg-accent px-5 py-3.5 rounded-lg no-underline text-center"
            onClick={() => setMobileMenuOpen(false)}
          >
            Fall starten →
          </Link>
          <Link
            href="/mein-fall"
            className="text-[17px] font-semibold text-accent border-2 border-accent px-5 py-3.5 rounded-lg no-underline text-center hover:bg-accent/5 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Mein Fall
          </Link>

          <hr className="border-border my-4" />

          <Link
            href="/impressum"
            className="text-[15px] text-muted-foreground py-2 no-underline hover:text-foreground transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Impressum
          </Link>
          <Link
            href="/datenschutz"
            className="text-[15px] text-muted-foreground py-2 no-underline hover:text-foreground transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Datenschutz
          </Link>
        </div>
      </div>
    </>
  );
}
