import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const caseId = formData.get("caseId") as string | null;

    if (!file || !caseId) {
      return NextResponse.json(
        { error: "Datei und Fall-ID erforderlich" },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Datei zu groß (max. 10 MB)" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Nicht unterstützter Dateityp. Erlaubt: PDF, PNG, JPG" },
        { status: 400 }
      );
    }

    // For now, store file metadata. In production, upload to S3/UploadThing.
    const upload = await prisma.upload.create({
      data: {
        caseId,
        filename: file.name,
        url: `/uploads/${caseId}/${file.name}`, // placeholder URL
        mimeType: file.type,
        size: file.size,
      },
    });

    return NextResponse.json(upload, { status: 201 });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Fehler beim Hochladen der Datei" },
      { status: 500 }
    );
  }
}
