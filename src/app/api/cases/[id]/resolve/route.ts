import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const updated = await prisma.case.update({
      where: { id },
      data: {
        status: "AUSSERGERICHTLICH_ENTSPERRT",
        entsperrtAm: new Date(),
      },
      include: { user: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error resolving case:", error);
    return NextResponse.json(
      { error: "Fehler beim Abschließen des Falls" },
      { status: 500 }
    );
  }
}
