import { NextResponse } from "next/server";
import { constructWebhookEvent } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    const event = constructWebhookEvent(body, signature);

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log("[Stripe Webhook] Checkout session completed:", session.id);
        console.log("[Stripe Webhook] Payment status:", session.payment_status);
        console.log("[Stripe Webhook] Metadata:", session.metadata);

        // The actual case creation happens on the success page
        // This webhook is for logging/monitoring purposes
        // and could be used for async processing if needed

        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        console.log("[Stripe Webhook] Payment succeeded:", paymentIntent.id);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        console.log("[Stripe Webhook] Payment failed:", paymentIntent.id);
        break;
      }

      default:
        console.log("[Stripe Webhook] Unhandled event type:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook] Error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 400 }
    );
  }
}
