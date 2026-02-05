import { NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/stripe";
import { createPayPalOrder } from "@/lib/paypal";
import { GEBUEHREN } from "@/lib/gebuehren";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { provider, kontotyp, email, sessionKey } = body;

    if (!provider || !kontotyp || !email || !sessionKey) {
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

    const validKontotyp = kontotyp as keyof typeof GEBUEHREN;
    const amount = GEBUEHREN[validKontotyp].gesamt;
    const metadata = {
      kontotyp,
      sessionKey, // Used to retrieve form data from client after payment
    };

    if (provider === "stripe") {
      const { url } = await createCheckoutSession({
        amount,
        kontotyp,
        customerEmail: email,
        metadata,
      });

      return NextResponse.json({ url });
    }

    if (provider === "paypal") {
      const { approvalUrl } = await createPayPalOrder({
        amount,
        kontotyp,
        metadata,
      });

      return NextResponse.json({ url: approvalUrl });
    }

    return NextResponse.json(
      { error: "Invalid payment provider" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
