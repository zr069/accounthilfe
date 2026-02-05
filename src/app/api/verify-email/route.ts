import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

// In-memory store for verification codes (in production, use Redis or DB)
// Map<email, { code: string, expiresAt: number }>
const verificationCodes = new Map<string, { code: string; expiresAt: number }>();

// Clean up expired codes periodically
function cleanupExpiredCodes() {
  const now = Date.now();
  for (const [email, data] of verificationCodes.entries()) {
    if (data.expiresAt < now) {
      verificationCodes.delete(email);
    }
  }
}

export function getVerificationCode(email: string): { code: string; expiresAt: number } | undefined {
  cleanupExpiredCodes();
  return verificationCodes.get(email.toLowerCase());
}

export function deleteVerificationCode(email: string): void {
  verificationCodes.delete(email.toLowerCase());
}

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

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store with 10 minute expiry
    const expiresAt = Date.now() + 10 * 60 * 1000;
    verificationCodes.set(email.toLowerCase(), { code, expiresAt });

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

    console.log(`[verify-email] Code sent to ${email}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[verify-email] Error:", error);
    return NextResponse.json(
      { error: "Fehler beim Senden des Codes" },
      { status: 500 }
    );
  }
}
