import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { berechneFrist } from "@/lib/fristlogik";
import { generateSequentialNumber, createInvoice } from "@/lib/invoice";
import { sendEmail, mandantConfirmationEmail, adminNewCaseEmail, type AdminEmailData } from "@/lib/email";
import { PLATFORM_CONFIG } from "@/lib/platforms";
import { SPERR_GRUENDE } from "@/types";
import type { Platform, SperrGrund, Kontotyp, PaymentMethod } from "@/generated/prisma/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      vorname,
      nachname,
      email,
      telefon,
      strasse,
      plz,
      stadt,
      platform,
      nutzername,
      registrierteEmail,
      sperrDatum,
      sperrGrund,
      sperrGrundFreitext,
      sperrDetails,
      kontotyp,
      gewerbBeschreibung,
      followerCount,
      monatlicheEinnahmen,
      vertraegeBetroffen,
      vollmacht,
      verguetung,
      datenschutz,
    } = body;

    // Fristberechnung
    const sperrDate = new Date(sperrDatum);
    const frist = berechneFrist(sperrDate);

    // Generate sequential case number
    const caseNumber = await generateSequentialNumber();

    // User erstellen oder finden
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          vorname,
          nachname,
          telefon: telefon || null,
          strasse,
          plz,
          stadt,
        },
      });
    }

    // Fall anlegen (without payment - this route is legacy/admin)
    const newCase = await prisma.case.create({
      data: {
        caseNumber,
        userId: user.id,
        status: "MANDAT_ERTEILT",
        track: frist.track.track as "A_INJUNCTION" | "B_LAWSUIT",
        platform: platform as Platform,
        nutzername,
        registrierteEmail,
        sperrDatum: sperrDate,
        sperrGrund: sperrGrund as SperrGrund,
        sperrGrundFreitext: sperrGrundFreitext || null,
        sperrDetails: sperrDetails || null,
        kontotyp: kontotyp as Kontotyp,
        gewerbBeschreibung: gewerbBeschreibung || null,
        followerCount: followerCount || null,
        monatlicheEinnahmen: monatlicheEinnahmen || null,
        vertraegeBetroffen: vertraegeBetroffen || false,
        monatsfristEnde: frist.monatsfristEnde,
        abmahnfristDatum: frist.fristDatum,
        abmahnfristTage: frist.fristTage,
        vollmachtErteilt: vollmacht,
        verguetungAkzeptiert: verguetung,
        datenschutzAkzeptiert: datenschutz,
        paymentStatus: "AUSSTEHEND",
      },
      include: { user: true },
    });

    // Create invoice
    await createInvoice(
      newCase.id,
      caseNumber,
      kontotyp as Kontotyp,
      "UEBERWEISUNG" as PaymentMethod
    );

    // Send confirmation emails (non-blocking – errors don't break case creation)
    const platformName = PLATFORM_CONFIG[platform as keyof typeof PLATFORM_CONFIG]?.name ?? platform;
    const sperrGrundLabel = SPERR_GRUENDE.find((g) => g.value === sperrGrund)?.label ?? sperrGrund;
    console.log(`[Cases] Sende E-Mails für Fall ${newCase.caseNumber}...`);
    try {
      const mandantEmail = mandantConfirmationEmail(
        newCase.caseNumber,
        vorname,
        nachname,
        platformName,
        nutzername
      );
      await sendEmail({ to: email, ...mandantEmail });
    } catch (e) {
      console.error("[Cases] Mandant-E-Mail fehlgeschlagen:", e);
    }
    try {
      const adminData: AdminEmailData = {
        caseNumber: newCase.caseNumber,
        vorname,
        nachname,
        email,
        telefon: telefon || undefined,
        strasse,
        plz,
        stadt,
        platform: platformName,
        nutzername,
        registrierteEmail,
        sperrDatum: new Date(sperrDatum).toLocaleDateString("de-DE"),
        sperrGrund: sperrGrundLabel,
        kontotyp,
        track: newCase.track,
        paymentMethod: "N/A",
        gewerbBeschreibung: gewerbBeschreibung || undefined,
        followerCount: followerCount || undefined,
        monatlicheEinnahmen: monatlicheEinnahmen || undefined,
      };
      const adminEmail = adminNewCaseEmail(adminData);
      await sendEmail({ to: "info@sarafi.de", ...adminEmail });
    } catch (e) {
      console.error("[Cases] Admin-E-Mail fehlgeschlagen:", e);
    }

    return NextResponse.json(newCase, { status: 201 });
  } catch (error) {
    console.error("Error creating case:", error);
    return NextResponse.json(
      { error: "Fehler beim Erstellen des Falls" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cases = await prisma.case.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(cases);
  } catch (error) {
    console.error("Error fetching cases:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der Fälle" },
      { status: 500 }
    );
  }
}
