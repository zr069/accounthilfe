import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "E-Mail-Adresse erforderlich" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Ungültige E-Mail-Adresse" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in database with 10 minute expiry
    // Delete any existing code for this email first
    await prisma.verificationCode.upsert({
      where: { email: normalizedEmail },
      update: {
        code,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
      create: {
        email: normalizedEmail,
        code,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    // Send verification email
    const emailContent = {
      subject: `Ihr Bestätigungscode: ${code}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <p style="font-size: 15px; color: #1A1A1A; margin: 0 0 16px 0;">Guten Tag,</p>
          <p style="font-size: 15px; color: #1A1A1A; margin: 0 0 24px 0;">Ihr Bestätigungscode lautet:</p>
          <div style="background-color: #f5f5f5; border-radius: 8px; padding: 24px; text-align: center; margin: 0 0 24px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #C8102E;">${code}</span>
          </div>
          <p style="font-size: 14px; color: #6B6B6B; margin: 0;">Der Code ist 10 Minuten gültig.</p>
          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0;" />
          <p style="font-size: 13px; color: #9A9A9A; margin: 0;">AccountHilfe.de – DR. SARAFI Rechtsanwaltsgesellschaft mbH</p>
        </div>
      `,
    };

    await sendEmail({ to: email, ...emailContent });

    console.log(`[verify-email] Code sent to ${normalizedEmail}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[verify-email] FEHLER:", error);
    console.error("[verify-email] Error message:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: "Fehler beim Senden des Codes" },
      { status: 500 }
    );
  }
}
