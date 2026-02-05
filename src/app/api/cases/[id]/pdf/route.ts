import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAbmahnungPdf } from "@/lib/abmahnung-pdf";
import { PLATFORM_CONFIG } from "@/lib/platforms";
import { SPERR_GRUENDE } from "@/types";
import type { Platform } from "@/generated/prisma/client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const lang = new URL(request.url).searchParams.get("lang") === "en" ? "en" as const : "de" as const;
    const { id } = await params;
    const caseData = await prisma.case.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!caseData) {
      return NextResponse.json(
        { error: "Fall nicht gefunden" },
        { status: 404 }
      );
    }

    const sperrGrundLabel =
      SPERR_GRUENDE.find((g) => g.value === caseData.sperrGrund)?.label ??
      caseData.sperrGrundFreitext ??
      "Unbekannt";

    const pdfBuffer = await generateAbmahnungPdf({
      vorname: caseData.user.vorname,
      nachname: caseData.user.nachname,
      strasse: caseData.user.strasse,
      plz: caseData.user.plz,
      stadt: caseData.user.stadt,
      platform: caseData.platform as Platform & keyof typeof PLATFORM_CONFIG,
      nutzername: caseData.nutzername,
      registrierteEmail: caseData.registrierteEmail,
      sperrDatum: caseData.sperrDatum,
      sperrGrund: sperrGrundLabel,
      sperrDetails: caseData.sperrDetails ?? undefined,
      kontotyp: caseData.kontotyp as "PRIVAT" | "GEWERBLICH",
      gewerbBeschreibung: caseData.gewerbBeschreibung ?? undefined,
      followerCount: caseData.followerCount ?? undefined,
      monatlicheEinnahmen: caseData.monatlicheEinnahmen ?? undefined,
      vertraegeBetroffen: caseData.vertraegeBetroffen,
      fristDatum: caseData.abmahnfristDatum,
      track: caseData.track as "A_INJUNCTION" | "B_LAWSUIT",
      erstellDatum: caseData.createdAt,
    }, lang);

    const filename = lang === "en"
      ? `CeaseAndDesist-${caseData.caseNumber}.pdf`
      : `Abmahnung-${caseData.caseNumber}.pdf`;

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Fehler bei der PDF-Generierung" },
      { status: 500 }
    );
  }
}
