import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stripeSessionId = searchParams.get("stripeSessionId");
    const paypalOrderId = searchParams.get("paypalOrderId");

    if (!stripeSessionId && !paypalOrderId) {
      return NextResponse.json(
        { error: "stripeSessionId or paypalOrderId required" },
        { status: 400 }
      );
    }

    let submission = null;

    if (stripeSessionId) {
      submission = await prisma.pendingSubmission.findUnique({
        where: { stripeSessionId },
      });
    } else if (paypalOrderId) {
      submission = await prisma.pendingSubmission.findUnique({
        where: { paypalOrderId },
      });
    }

    if (!submission) {
      return NextResponse.json(
        { error: "No pending submission found" },
        { status: 404 }
      );
    }

    // Check if expired
    if (new Date() > submission.expiresAt) {
      // Delete expired submission
      await prisma.pendingSubmission.delete({
        where: { id: submission.id },
      });
      return NextResponse.json(
        { error: "Submission expired" },
        { status: 410 }
      );
    }

    // Parse and return form data
    const formData = JSON.parse(submission.formData);

    return NextResponse.json({ formData });
  } catch (error) {
    console.error("[pending-submission] Error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve submission" },
      { status: 500 }
    );
  }
}

// Delete a pending submission after successful case creation
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stripeSessionId = searchParams.get("stripeSessionId");
    const paypalOrderId = searchParams.get("paypalOrderId");

    if (stripeSessionId) {
      await prisma.pendingSubmission.delete({
        where: { stripeSessionId },
      }).catch(() => {}); // Ignore if not found
    }

    if (paypalOrderId) {
      await prisma.pendingSubmission.delete({
        where: { paypalOrderId },
      }).catch(() => {}); // Ignore if not found
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[pending-submission] Delete error:", error);
    return NextResponse.json({ success: true }); // Don't fail on cleanup
  }
}
