import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const caseData = await prisma.case.findUnique({
      where: { id },
      include: { user: true, uploads: true, notifications: true },
    });

    if (!caseData) {
      return NextResponse.json(
        { error: "Fall nicht gefunden" },
        { status: 404 }
      );
    }

    return NextResponse.json(caseData);
  } catch (error) {
    console.error("Error fetching case:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden des Falls" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await prisma.case.update({
      where: { id },
      data: body,
      include: { user: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating case:", error);
    return NextResponse.json(
      { error: "Fehler beim Aktualisieren des Falls" },
      { status: 500 }
    );
  }
}
