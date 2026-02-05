import { NextResponse } from "next/server";
import { getVerificationCode, deleteVerificationCode } from "../route";

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

    const storedData = getVerificationCode(email);

    if (!storedData) {
      return NextResponse.json(
        { error: "Kein Code für diese E-Mail-Adresse gefunden. Bitte neuen Code anfordern." },
        { status: 400 }
      );
    }

    if (Date.now() > storedData.expiresAt) {
      deleteVerificationCode(email);
      return NextResponse.json(
        { error: "Code abgelaufen. Bitte neuen Code anfordern." },
        { status: 400 }
      );
    }

    if (storedData.code !== code.trim()) {
      return NextResponse.json(
        { error: "Ungültiger Code" },
        { status: 400 }
      );
    }

    // Code is valid - delete it so it can't be reused
    deleteVerificationCode(email);

    console.log(`[verify-email] Email verified: ${email}`);

    return NextResponse.json({ success: true, verified: true });
  } catch (error) {
    console.error("[verify-email/confirm] Error:", error);
    return NextResponse.json(
      { error: "Fehler bei der Verifizierung" },
      { status: 500 }
    );
  }
}
