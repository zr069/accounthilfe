import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const STATUS_MAP: Record<string, string> = {
  MANDAT_ERTEILT: "In Bearbeitung",
  ABMAHNUNG_VERSANDT: "Abmahnung versandt",
  AUSSERGERICHTLICH_ENTSPERRT: "Erfolgreich entsperrt",
  FRIST_VERSTRICHEN: "Frist verstrichen – nächste Schritte",
  GERICHTSPROZESS_EINGELEITET: "Gerichtliches Verfahren",
  TERMIN_ANGESETZT: "Gerichtliches Verfahren",
  GERICHTLICH_ENTSPERRT: "Erfolgreich entsperrt",
  ABGESCHLOSSEN: "Abgeschlossen",
};

export async function POST(request: Request) {
  try {
    const { email, caseNumber } = await request.json();

    if (!email || !caseNumber) {
      return NextResponse.json(
        { error: "E-Mail und Fallnummer sind erforderlich" },
        { status: 400 }
      );
    }

    const caseData = await prisma.case.findFirst({
      where: {
        caseNumber,
        user: { email },
      },
      include: { user: true },
    });

    if (!caseData) {
      return NextResponse.json(
        { error: "Kein Fall mit diesen Angaben gefunden" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      caseNumber: caseData.caseNumber,
      status: STATUS_MAP[caseData.status] ?? caseData.status,
      platform: caseData.platform,
      track: caseData.track,
      abmahnfristDatum: caseData.abmahnfristDatum,
      createdAt: caseData.createdAt,
      paymentStatus: caseData.paymentStatus,
      paymentMethod: caseData.paymentMethod,
      kontotyp: caseData.kontotyp,
    });
  } catch (error) {
    console.error("Error looking up case:", error);
    return NextResponse.json(
      { error: "Fehler bei der Fallabfrage" },
      { status: 500 }
    );
  }
}
