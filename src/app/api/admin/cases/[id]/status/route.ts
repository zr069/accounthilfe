import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { CaseStatus } from "@/generated/prisma/client";

const VALID_STATUSES: CaseStatus[] = [
  "MANDAT_ERTEILT",
  "ABMAHNUNG_VERSANDT",
  "AUSSERGERICHTLICH_ENTSPERRT",
  "FRIST_VERSTRICHEN",
  "GERICHTSPROZESS_EINGELEITET",
  "TERMIN_ANGESETZT",
  "GERICHTLICH_ENTSPERRT",
  "ABGESCHLOSSEN",
];

function verifyBasicAuth(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  const adminUser = process.env.ADMIN_USER || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin";

  if (!authHeader) return false;

  const [scheme, encoded] = authHeader.split(" ");
  if (scheme !== "Basic" || !encoded) return false;

  const decoded = atob(encoded);
  const [user, password] = decoded.split(":");
  return user === adminUser && password === adminPassword;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyBasicAuth(request)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    // Build update data based on what fields are provided
    const updateData: Record<string, unknown> = {};

    if (body.status !== undefined) {
      if (!VALID_STATUSES.includes(body.status)) {
        return NextResponse.json(
          { error: "Ungültiger Status" },
          { status: 400 }
        );
      }
      updateData.status = body.status;

      // Auto-set entsperrtAm for success statuses
      if (body.status === "AUSSERGERICHTLICH_ENTSPERRT" || body.status === "GERICHTLICH_ENTSPERRT") {
        updateData.entsperrtAm = new Date();
      }
    }

    if (body.interneNotizen !== undefined) {
      updateData.interneNotizen = body.interneNotizen;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Keine Änderungen angegeben" },
        { status: 400 }
      );
    }

    const updated = await prisma.case.update({
      where: { id },
      data: updateData,
      include: { user: true, uploads: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating case:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Fehler beim Aktualisieren", details: errorMessage },
      { status: 500 }
    );
  }
}
