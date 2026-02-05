import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    stripeInstance = new Stripe(key, {
      apiVersion: "2026-01-28.clover",
    });
  }
  return stripeInstance;
}

export async function createCheckoutSession({
  amount,
  kontotyp,
  customerEmail,
  metadata,
  baseUrl,
}: {
  amount: number;
  kontotyp: string;
  customerEmail: string;
  metadata: Record<string, string>;
  baseUrl: string;
}): Promise<{ sessionId: string; url: string }> {
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card", "sepa_debit"],
    mode: "payment",
    customer_email: customerEmail,
    line_items: [
      {
        price_data: {
          currency: "eur",
          unit_amount: Math.round(amount * 100), // Stripe uses cents
          product_data: {
            name: `Außergerichtliche Vertretung (${kontotyp === "GEWERBLICH" ? "Gewerblich" : "Privat"})`,
            description: "Anwaltliche Abmahnung zur Kontowiederherstellung",
          },
        },
        quantity: 1,
      },
    ],
    metadata,
    success_url: `${baseUrl}/zahlung/erfolg?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/zahlung/abbruch`,
  });

  if (!session.url) {
    throw new Error("Failed to create checkout session");
  }

  return {
    sessionId: session.id,
    url: session.url,
  };
}

export async function retrieveSession(sessionId: string): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  return stripe.checkout.sessions.retrieve(sessionId);
}

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}
