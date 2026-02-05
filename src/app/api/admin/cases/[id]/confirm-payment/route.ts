import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Find the case
    const caseData = await prisma.case.findUnique({
      where: { id },
      include: { user: true, invoice: true },
    });

    if (!caseData) {
      return NextResponse.json(
        { error: "Fall nicht gefunden" },
        { status: 404 }
      );
    }

    if (caseData.paymentStatus === "BEZAHLT") {
      return NextResponse.json(
        { error: "Zahlung bereits bestätigt" },
        { status: 400 }
      );
    }

    // Update case payment status
    const updatedCase = await prisma.case.update({
      where: { id },
      data: {
        paymentStatus: "BEZAHLT",
      },
      include: { user: true, uploads: true },
    });

    // Update invoice status if exists
    if (caseData.invoice) {
      await prisma.invoice.update({
        where: { id: caseData.invoice.id },
        data: {
          status: "BEZAHLT",
          paidAt: new Date(),
        },
      });
    }

    // Send confirmation email to client
    try {
      await sendEmail({
        to: caseData.user.email,
        subject: `Zahlungseingang bestätigt – Fall ${caseData.caseNumber}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="display: inline-block; width: 48px; height: 48px; background-color: #C8102E; border-radius: 8px; color: white; font-size: 24px; font-weight: bold; line-height: 48px; font-family: Georgia, serif;">§</div>
            </div>

            <p style="font-size: 15px; color: #1A1A1A; margin: 0 0 16px 0;">Guten Tag ${caseData.user.vorname} ${caseData.user.nachname},</p>

            <p style="font-size: 15px; color: #1A1A1A; margin: 0 0 16px 0;">
              vielen Dank für Ihre Zahlung. Der Zahlungseingang für Ihren Fall <strong style="color: #C8102E;">${caseData.caseNumber}</strong> wurde erfolgreich verbucht.
            </p>

            <div style="background-color: #F0FFF4; border: 1px solid #38A16920; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <p style="font-size: 14px; font-weight: 600; color: #38A169; margin: 0 0 8px 0;">
                ✓ Zahlung bestätigt
              </p>
              <p style="font-size: 14px; color: #4A5568; margin: 0;">
                Wir beginnen nun umgehend mit der Bearbeitung Ihres Falls und werden zeitnah das anwaltliche Schreiben an die Plattform versenden.
              </p>
            </div>

            <p style="font-size: 14px; color: #6B6B6B; margin: 0 0 8px 0;">
              Sie können den Status Ihres Falls jederzeit unter <a href="https://accounthilfe.de/mein-fall" style="color: #C8102E;">accounthilfe.de/mein-fall</a> abrufen.
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
      console.error("[confirm-payment] Email sending failed:", e);
    }

    console.log(`[Admin] Payment confirmed for case ${caseData.caseNumber}`);

    return NextResponse.json(updatedCase);
  } catch (error) {
    console.error("Error confirming payment:", error);
    return NextResponse.json(
      { error: "Fehler bei der Zahlungsbestätigung" },
      { status: 500 }
    );
  }
}
