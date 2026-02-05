import { NextResponse } from "next/server";

// PayPal webhook verification would require the PayPal SDK
// For now, we log the events - the actual case creation happens on the success page
export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("[PayPal Webhook] Event received:", body.event_type);
    console.log("[PayPal Webhook] Resource:", JSON.stringify(body.resource, null, 2));

    // Handle different PayPal events
    switch (body.event_type) {
      case "CHECKOUT.ORDER.APPROVED":
        console.log("[PayPal Webhook] Order approved:", body.resource?.id);
        break;

      case "PAYMENT.CAPTURE.COMPLETED":
        console.log("[PayPal Webhook] Payment captured:", body.resource?.id);
        break;

      case "PAYMENT.CAPTURE.DENIED":
        console.log("[PayPal Webhook] Payment denied:", body.resource?.id);
        break;

      default:
        console.log("[PayPal Webhook] Unhandled event type:", body.event_type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[PayPal Webhook] Error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 400 }
    );
  }
}
