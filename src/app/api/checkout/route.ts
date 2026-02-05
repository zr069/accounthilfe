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

    const validKontotyp = kontotyp as keyof typeof GEBUEHREN;
    const amount = GEBUEHREN[validKontotyp].gesamt;

    if (provider === "stripe") {
      // Create Stripe session first to get the session ID
      const { sessionId, url } = await createCheckoutSession({
        amount,
        kontotyp,
        customerEmail: email,
        metadata: { kontotyp },
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
      const { approvalUrl, orderId } = await createPayPalOrder({
        amount,
        kontotyp,
        metadata: { kontotyp },
      });

      // Store form data in database with PayPal order ID
      if (formData && orderId) {
        await prisma.pendingSubmission.create({
          data: {
            paypalOrderId: orderId,
            formData: JSON.stringify(formData),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          },
        });
        console.log(`[checkout] Stored form data for PayPal order ${orderId}`);
      }

      return NextResponse.json({ url: approvalUrl, orderId });
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
