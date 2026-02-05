import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { berechneFrist } from "@/lib/fristlogik";
import { generateSequentialNumber, createInvoice } from "@/lib/invoice";
import { sendEmail, mandantConfirmationEmail, adminNewCaseEmail, type AdminEmailData } from "@/lib/email";
import { SPERR_GRUENDE } from "@/types";
import { PLATFORM_CONFIG } from "@/lib/platforms";
import { retrieveSession } from "@/lib/stripe";
import { capturePayPalOrder } from "@/lib/paypal";
import type { Platform, SperrGrund, Kontotyp, PaymentMethod } from "@/generated/prisma/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      // Payment info
      provider, // 'stripe' or 'paypal'
      stripeSessionId,
      paypalOrderId,
      // Form data
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

    // Verify payment
    let paymentId: string | undefined;
    let paymentMethod: PaymentMethod;

    if (provider === "stripe") {
      if (!stripeSessionId) {
        return NextResponse.json(
          { error: "Missing Stripe session ID" },
          { status: 400 }
        );
      }

      try {
        const session = await retrieveSession(stripeSessionId);
        if (session.payment_status !== "paid") {
          return NextResponse.json(
            { error: "Payment not completed" },
            { status: 400 }
          );
        }
        paymentId = session.payment_intent as string || session.id;
        paymentMethod = "STRIPE";
      } catch (e) {
        console.error("Failed to verify Stripe session:", e);
        return NextResponse.json(
          { error: "Failed to verify payment" },
          { status: 400 }
        );
      }
    } else if (provider === "paypal") {
      if (!paypalOrderId) {
        return NextResponse.json(
          { error: "Missing PayPal order ID" },
          { status: 400 }
        );
      }

      try {
        const result = await capturePayPalOrder(paypalOrderId);
        if (result.status !== "COMPLETED") {
          return NextResponse.json(
            { error: "Payment not completed" },
            { status: 400 }
          );
        }
        paymentId = result.paymentId;
        paymentMethod = "PAYPAL";
      } catch (e) {
        console.error("Failed to capture PayPal order:", e);
        return NextResponse.json(
          { error: "Failed to verify payment" },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Invalid payment provider" },
        { status: 400 }
      );
    }

    // Check if case with this payment ID already exists (prevent duplicates)
    const existingCase = await prisma.case.findFirst({
      where: { paymentId },
    });

    if (existingCase) {
      return NextResponse.json({
        caseNumber: existingCase.caseNumber,
        alreadyExists: true,
      });
    }

    // Fristberechnung
    const sperrDate = new Date(sperrDatum);
    const frist = berechneFrist(sperrDate);

    // Generate sequential case number
    const caseNumber = await generateSequentialNumber();

    // Log form data for debugging
    console.log(`[Cases] Creating case with form data:`, {
      vorname,
      nachname,
      email,
      strasse,
      plz,
      stadt,
      telefon,
    });

    // User erstellen oder aktualisieren (IMMER mit neuen Formulardaten!)
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        // Aktualisiere IMMER mit den neuen Formulardaten
        vorname,
        nachname,
        telefon: telefon || null,
        strasse,
        plz,
        stadt,
      },
      create: {
        email,
        vorname,
        nachname,
        telefon: telefon || null,
        strasse,
        plz,
        stadt,
      },
    });

    console.log(`[Cases] User upserted:`, {
      id: user.id,
      vorname: user.vorname,
      nachname: user.nachname,
      strasse: user.strasse,
    });

    // Fall anlegen mit Zahlungsinformationen
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
        paymentId,
        paymentMethod,
        paymentStatus: "BEZAHLT", // Stripe/PayPal payments are immediately paid
      },
      include: { user: true },
    });

    // Create invoice (already paid for Stripe/PayPal)
    await createInvoice(
      newCase.id,
      caseNumber,
      kontotyp as Kontotyp,
      paymentMethod
    );

    // Send confirmation emails (non-blocking)
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
        paymentMethod,
        gewerbBeschreibung: gewerbBeschreibung || undefined,
        followerCount: followerCount || undefined,
        monatlicheEinnahmen: monatlicheEinnahmen || undefined,
      };
      const adminEmail = adminNewCaseEmail(adminData);
      await sendEmail({ to: "info@sarafi.de", ...adminEmail });
    } catch (e) {
      console.error("[Cases] Admin-E-Mail fehlgeschlagen:", e);
    }

    return NextResponse.json({
      caseNumber: newCase.caseNumber,
      id: newCase.id,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating case after payment:", error);
    return NextResponse.json(
      { error: "Fehler beim Erstellen des Falls" },
      { status: 500 }
    );
  }
}
