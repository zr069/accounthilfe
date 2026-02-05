import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "E-Mail-Adresse erforderlich" },
        { status: 400 }
      );
    }

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Code erforderlich" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const trimmedCode = code.trim();

    // Get verification code from database
    const storedCode = await prisma.verificationCode.findUnique({
      where: { email: normalizedEmail },
    });

    if (!storedCode) {
      console.log(`[verify-email/confirm] No code found for ${normalizedEmail}`);
      return NextResponse.json(
        { error: "Kein Code für diese E-Mail-Adresse gefunden. Bitte neuen Code anfordern." },
        { status: 400 }
      );
    }

    // Check if expired
    if (new Date() > storedCode.expiresAt) {
      // Delete expired code
      await prisma.verificationCode.delete({
        where: { email: normalizedEmail },
      });
      return NextResponse.json(
        { error: "Code abgelaufen. Bitte neuen Code anfordern." },
        { status: 400 }
      );
    }

    // Check if code matches
    if (storedCode.code !== trimmedCode) {
      return NextResponse.json(
        { error: "Ungültiger Code" },
        { status: 400 }
      );
    }

    // Code is valid - delete it so it can't be reused
    await prisma.verificationCode.delete({
      where: { email: normalizedEmail },
    });

    console.log(`[verify-email/confirm] Email verified: ${normalizedEmail}`);

    return NextResponse.json({ success: true, verified: true });
  } catch (error) {
    console.error("[verify-email/confirm] Error:", error);
    return NextResponse.json(
      { error: "Fehler bei der Verifizierung" },
      { status: 500 }
    );
  }
}
