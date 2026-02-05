// eslint-disable-next-line @typescript-eslint/no-require-imports
const paypal = require("@paypal/checkout-server-sdk");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let paypalClient: any = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getPayPalClient(): any {
  if (!paypalClient) {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET is not set");
    }

    // Use Sandbox for development, Live for production
    const environment =
      process.env.NODE_ENV === "production"
        ? new paypal.core.LiveEnvironment(clientId, clientSecret)
        : new paypal.core.SandboxEnvironment(clientId, clientSecret);

    paypalClient = new paypal.core.PayPalHttpClient(environment);
  }
  return paypalClient;
}

export async function createPayPalOrder({
  amount,
  kontotyp,
  metadata,
  baseUrl,
}: {
  amount: number;
  kontotyp: string;
  metadata: Record<string, string>;
  baseUrl: string;
}): Promise<{ orderId: string; approvalUrl: string }> {
  const client = getPayPalClient();

  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "EUR",
          value: amount.toFixed(2),
        },
        description: `Außergerichtliche Vertretung (${kontotyp === "GEWERBLICH" ? "Gewerblich" : "Privat"})`,
        custom_id: JSON.stringify(metadata),
      },
    ],
    application_context: {
      return_url: `${baseUrl}/zahlung/erfolg?paypal=true`,
      cancel_url: `${baseUrl}/zahlung/abbruch`,
      brand_name: "AccountHilfe.de",
      landing_page: "LOGIN",
      user_action: "PAY_NOW",
    },
  });

  const response = await client.execute(request);
  const order = response.result;

  const approvalLink = order.links?.find(
    (link: { rel: string; href: string }) => link.rel === "approve"
  );

  if (!approvalLink) {
    throw new Error("No approval URL in PayPal response");
  }

  return {
    orderId: order.id,
    approvalUrl: approvalLink.href,
  };
}

export async function capturePayPalOrder(orderId: string): Promise<{
  status: string;
  paymentId: string;
  metadata: Record<string, string> | null;
}> {
  const client = getPayPalClient();

  const request = new paypal.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});

  const response = await client.execute(request);
  const order = response.result;

  // Extract metadata from custom_id
  let metadata: Record<string, string> | null = null;
  try {
    const customId = order.purchase_units?.[0]?.payments?.captures?.[0]?.custom_id
      || order.purchase_units?.[0]?.custom_id;
    if (customId) {
      metadata = JSON.parse(customId);
    }
  } catch {
    // Ignore JSON parse errors
  }

  return {
    status: order.status,
    paymentId: order.id,
    metadata,
  };
}

export async function getPayPalOrder(orderId: string): Promise<{
  status: string;
  metadata: Record<string, string> | null;
}> {
  const client = getPayPalClient();

  const request = new paypal.orders.OrdersGetRequest(orderId);
  const response = await client.execute(request);
  const order = response.result;

  // Extract metadata from custom_id
  let metadata: Record<string, string> | null = null;
  try {
    const customId = order.purchase_units?.[0]?.custom_id;
    if (customId) {
      metadata = JSON.parse(customId);
    }
  } catch {
    // Ignore JSON parse errors
  }

  return {
    status: order.status,
    metadata,
  };
}
