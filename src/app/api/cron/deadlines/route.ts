import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  sendEmail,
  deadlineReminderEmail,
  deadlineExpiredEmail,
} from "@/lib/email";
import { differenceInDays, format } from "date-fns";
import { de } from "date-fns/locale";

export async function GET(request: Request) {
  // Auth-Check: Nur von Cron-Service aufrufbar
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const heute = new Date();

  const cases = await prisma.case.findMany({
    where: {
      status: { in: ["MANDAT_ERTEILT", "ABMAHNUNG_VERSANDT"] },
    },
    include: { user: true, notifications: true },
  });

  let checked = 0;

  for (const c of cases) {
    const tageVerbleibend = differenceInDays(c.abmahnfristDatum, heute);
    const fristFormatiert = format(c.abmahnfristDatum, "d. MMMM yyyy", {
      locale: de,
    });

    const alreadySent = (type: string) =>
      c.notifications.some((n) => n.type === type);

    // 3 Tage vor Ablauf
    if (tageVerbleibend === 3 && !alreadySent("DEADLINE_REMINDER_3D")) {
      const { subject, html } = deadlineReminderEmail(
        c.caseNumber,
        3,
        fristFormatiert
      );
      await sendEmail({ to: c.user.email, subject, html });
      await prisma.notification.create({
        data: { caseId: c.id, type: "DEADLINE_REMINDER_3D" },
      });

      if (c.status !== "ABMAHNUNG_VERSANDT") {
        await prisma.case.update({
          where: { id: c.id },
          data: { status: "ABMAHNUNG_VERSANDT" },
        });
      }
    }

    // 1 Tag vor Ablauf
    if (tageVerbleibend === 1 && !alreadySent("DEADLINE_REMINDER_1D")) {
      const { subject, html } = deadlineReminderEmail(
        c.caseNumber,
        1,
        fristFormatiert
      );
      await sendEmail({ to: c.user.email, subject, html });
      await prisma.notification.create({
        data: { caseId: c.id, type: "DEADLINE_REMINDER_1D" },
      });
    }

    // Frist abgelaufen
    if (tageVerbleibend <= 0 && !alreadySent("DEADLINE_EXPIRED")) {
      const nextStep =
        c.track === "A_INJUNCTION"
          ? "Wir bereiten den Antrag auf einstweilige Verfügung vor."
          : "Wir bereiten die Klageschrift vor.";

      const { subject, html } = deadlineExpiredEmail(c.caseNumber, nextStep);
      await sendEmail({ to: c.user.email, subject, html });

      await prisma.case.update({
        where: { id: c.id },
        data: { status: "FRIST_VERSTRICHEN" },
      });

      await prisma.notification.create({
        data: { caseId: c.id, type: "DEADLINE_EXPIRED" },
      });
    }

    checked++;
  }

  return NextResponse.json({ checked, timestamp: heute.toISOString() });
}
