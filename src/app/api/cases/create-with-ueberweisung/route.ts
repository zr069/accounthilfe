import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { berechneFrist } from "@/lib/fristlogik";
import { generateSequentialNumber, createInvoice, BANK_DETAILS } from "@/lib/invoice";
import { sendEmail, adminNewCaseEmail, type AdminEmailData } from "@/lib/email";
import { SPERR_GRUENDE } from "@/types";
import { PLATFORM_CONFIG } from "@/lib/platforms";
import { GEBUEHREN, formatCurrency } from "@/lib/gebuehren";
import type { Platform, SperrGrund, Kontotyp } from "@/generated/prisma/client";

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

    // User erstellen oder aktualisieren (IMMER mit neuen Formulardaten!)
    const user = await prisma.user.upsert({
      where: { email },
      update: {
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

    // Fall anlegen - Zahlung ausstehend
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
        paymentMethod: "UEBERWEISUNG",
        paymentStatus: "AUSSTEHEND",
      },
      include: { user: true },
    });

    // Create invoice (status OFFEN for bank transfer)
    await createInvoice(
      newCase.id,
      caseNumber,
      kontotyp as Kontotyp,
      "UEBERWEISUNG"
    );

    // Send confirmation emails
    const platformName = PLATFORM_CONFIG[platform as keyof typeof PLATFORM_CONFIG]?.name ?? platform;
    const sperrGrundLabel = SPERR_GRUENDE.find((g) => g.value === sperrGrund)?.label ?? sperrGrund;
    const fees = GEBUEHREN[kontotyp as keyof typeof GEBUEHREN];

    console.log(`[Cases] Sende E-Mails für Überweisung-Fall ${caseNumber}...`);

    // Mandant confirmation with bank details
    try {
      await sendEmail({
        to: email,
        subject: `Ihr Fall ${caseNumber} – Zahlungsinformationen`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="display: inline-block; width: 48px; height: 48px; background-color: #C8102E; border-radius: 8px; color: white; font-size: 24px; font-weight: bold; line-height: 48px; font-family: Georgia, serif;">§</div>
            </div>

            <p style="font-size: 15px; color: #1A1A1A; margin: 0 0 16px 0;">Guten Tag ${vorname} ${nachname},</p>

            <p style="font-size: 15px; color: #1A1A1A; margin: 0 0 24px 0;">
              vielen Dank für Ihren Auftrag. Ihr Fall wurde unter der Nummer <strong style="color: #C8102E;">${caseNumber}</strong> erfasst.
            </p>

            <div style="background-color: #FFF8F8; border: 1px solid #C8102E20; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
              <p style="font-size: 14px; font-weight: 600; color: #C8102E; margin: 0 0 12px 0;">Bitte überweisen Sie den Rechnungsbetrag:</p>
              <p style="font-size: 24px; font-weight: bold; color: #C8102E; margin: 0 0 16px 0;">${formatCurrency(fees.gesamt)}</p>

              <table style="width: 100%; font-size: 14px; color: #1A1A1A;">
                <tr>
                  <td style="padding: 4px 0; color: #6B6B6B;">Empfänger:</td>
                  <td style="padding: 4px 0; font-weight: 500;">${BANK_DETAILS.empfaenger}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #6B6B6B;">Bank:</td>
                  <td style="padding: 4px 0; font-weight: 500;">${BANK_DETAILS.bank}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #6B6B6B;">IBAN:</td>
                  <td style="padding: 4px 0; font-weight: 500; font-family: monospace;">${BANK_DETAILS.iban}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #6B6B6B;">BIC:</td>
                  <td style="padding: 4px 0; font-weight: 500; font-family: monospace;">${BANK_DETAILS.bic}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #6B6B6B;">Verwendungszweck:</td>
                  <td style="padding: 4px 0; font-weight: 600; color: #C8102E;">${caseNumber}</td>
                </tr>
              </table>
            </div>

            <p style="font-size: 14px; color: #6B6B6B; margin: 0 0 16px 0;">
              <strong>Wichtig:</strong> Bitte geben Sie unbedingt die Fallnummer <strong>${caseNumber}</strong> als Verwendungszweck an, damit wir Ihre Zahlung zuordnen können.
            </p>

            <p style="font-size: 14px; color: #6B6B6B; margin: 0 0 8px 0;">
              Nach Zahlungseingang beginnen wir umgehend mit der Bearbeitung Ihres Falls.
            </p>

            <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0;" />

            <p style="font-size: 13px; color: #9A9A9A; margin: 0;">
              AccountHilfe.de – DR. SARAFI Rechtsanwaltsgesellschaft mbH<br />
              Tel: +49 69 348 755 200 · E-Mail: info@sarafi.de
            </p>
          </div>
        `,
      });
    } catch (e) {
      console.error("[Cases] Mandant-E-Mail fehlgeschlagen:", e);
    }

    // Admin notification
    try {
      const adminData: AdminEmailData = {
        caseNumber,
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
        paymentMethod: "UEBERWEISUNG (ausstehend)",
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
      caseNumber,
      id: newCase.id,
      paymentMethod: "UEBERWEISUNG",
      amount: fees.gesamt,
      bankDetails: BANK_DETAILS,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating case with Überweisung:", error);
    return NextResponse.json(
      { error: "Fehler beim Erstellen des Falls" },
      { status: 500 }
    );
  }
}
