import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createCheckoutSession } from "@/lib/stripe";
import { createPayPalOrder } from "@/lib/paypal";
import { GEBUEHREN } from "@/lib/gebuehren";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { provider, kontotyp, email, formData } = body;

    if (!provider || !kontotyp || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (kontotyp !== "PRIVAT" && kontotyp !== "GEWERBLICH") {
      return NextResponse.json(
        { error: "Invalid kontotyp" },
        { status: 400 }
      );
    }

    // Determine base URL: ENV > origin header > localhost fallback
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      request.headers.get("origin") ||
      "http://localhost:3000";

    console.log(`[checkout] Using baseUrl: ${baseUrl}`);

    const validKontotyp = kontotyp as keyof typeof GEBUEHREN;
    const amount = GEBUEHREN[validKontotyp].gesamt;

    if (provider === "stripe") {
      // Create Stripe session first to get the session ID
      const { sessionId, url } = await createCheckoutSession({
        amount,
        kontotyp,
        customerEmail: email,
        metadata: { kontotyp },
        baseUrl,
      });

      // Store form data in database with Stripe session ID
      if (formData) {
        await prisma.pendingSubmission.create({
          data: {
            stripeSessionId: sessionId,
            formData: JSON.stringify(formData),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          },
        });
        console.log(`[checkout] Stored form data for Stripe session ${sessionId}`);
      }

      return NextResponse.json({ url, sessionId });
    }

    if (provider === "paypal") {
      // PayPal temporarily disabled - sandbox keys don't work in production
      return NextResponse.json(
        { error: "PayPal ist derzeit nicht verfügbar. Bitte wählen Sie Kreditkarte oder Überweisung." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Invalid payment provider" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Checkout error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unbekannter Fehler";
    return NextResponse.json(
      { error: `Fehler beim Erstellen der Zahlungssitzung: ${errorMessage}` },
      { status: 500 }
    );
  }
}
