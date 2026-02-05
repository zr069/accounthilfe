import { prisma } from "@/lib/prisma";
import { GEBUEHREN, formatCurrency } from "@/lib/gebuehren";
import type { Kontotyp, PaymentMethod } from "@/generated/prisma/client";

export type InvoiceLineItem = {
  description: string;
  amount: number; // in cents
};

/**
 * Generate sequential case/invoice number: AH-YYYY-NNNN
 * Uses atomic counter to prevent race conditions
 */
export async function generateSequentialNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();

  // Use upsert to atomically get and increment counter
  const counter = await prisma.counter.upsert({
    where: { id: "case_counter" },
    update: {
      counter: { increment: 1 },
      // Reset counter if year changed
      year: currentYear,
    },
    create: {
      id: "case_counter",
      year: currentYear,
      counter: 1,
    },
  });

  // If the year changed, we need to reset the counter
  if (counter.year !== currentYear) {
    const resetCounter = await prisma.counter.update({
      where: { id: "case_counter" },
      data: {
        year: currentYear,
        counter: 1,
      },
    });
    return `AH-${currentYear}-${String(resetCounter.counter).padStart(4, "0")}`;
  }

  return `AH-${currentYear}-${String(counter.counter).padStart(4, "0")}`;
}

/**
 * Build invoice line items based on kontotyp
 */
export function buildInvoiceItems(kontotyp: Kontotyp): InvoiceLineItem[] {
  const fees = GEBUEHREN[kontotyp];

  return [
    {
      description: `Geschäftsgebühr gem. Nr. 2300, 1008 VV RVG (Streitwert: ${formatCurrency(fees.streitwert)})`,
      amount: Math.round(fees.geschaeftsgebuehr * 100),
    },
    {
      description: "Auslagenpauschale gem. Nr. 7001, 7002 VV RVG",
      amount: Math.round(fees.auslagen * 100),
    },
    {
      description: "19% USt. gem. Nr. 7008 VV RVG",
      amount: Math.round(fees.ust * 100),
    },
  ];
}

/**
 * Create invoice for a case
 */
export async function createInvoice(
  caseId: string,
  invoiceNumber: string,
  kontotyp: Kontotyp,
  paymentMethod: PaymentMethod
) {
  const fees = GEBUEHREN[kontotyp];
  const items = buildInvoiceItems(kontotyp);

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      caseId,
      amount: Math.round(fees.gesamt * 100),
      netAmount: Math.round((fees.geschaeftsgebuehr + fees.auslagen) * 100),
      vatAmount: Math.round(fees.ust * 100),
      vatRate: 19,
      items: JSON.stringify(items),
      status: paymentMethod === "UEBERWEISUNG" ? "OFFEN" : "BEZAHLT",
      paymentMethod,
      paidAt: paymentMethod !== "UEBERWEISUNG" ? new Date() : null,
    },
  });

  return invoice;
}

/**
 * Bank details for Überweisung
 */
export const BANK_DETAILS = {
  empfaenger: "DR. SARAFI Rechtsanwaltsgesellschaft mbH",
  bank: "Frankfurter Sparkasse",
  iban: "DE90 5005 0201 0200 7049 07",
  bic: "HELADEF1822",
  ustId: "DE326113355",
};

/**
 * Format cents to EUR string
 */
export function formatCents(cents: number): string {
  return (cents / 100).toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + " €";
}
