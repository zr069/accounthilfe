import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  console.log(`[Email] sendEmail aufgerufen für: ${to}`);
  console.log(`[Email] SMTP_HOST: ${process.env.SMTP_HOST ? "gesetzt" : "FEHLT"}`);
  console.log(`[Email] SMTP_USER: ${process.env.SMTP_USER ? "gesetzt" : "FEHLT"}`);
  console.log(`[Email] SMTP_PASS: ${process.env.SMTP_PASS ? "gesetzt" : "FEHLT"}`);

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    const error = new Error(
      `SMTP nicht konfiguriert! HOST=${!!process.env.SMTP_HOST}, USER=${!!process.env.SMTP_USER}, PASS=${!!process.env.SMTP_PASS}`
    );
    console.error(`[Email] ${error.message}`);
    throw error;
  }

  try {
    const result = await transporter.sendMail({
      from: "AccountHilfe.de <info@accounthilfe.de>",
      replyTo: "info@sarafi.de",
      to,
      subject,
      html,
    });
    console.log(`[Email] Erfolgreich gesendet an ${to}: ${subject}`, result.messageId);
    return result;
  } catch (error) {
    console.error(`[Email] FEHLER beim Senden an ${to}:`, error);
    throw error;
  }
}

// Base styles for all emails
const emailStyles = `
  body { margin: 0; padding: 0; background-color: #f5f5f5; }
  .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
  .header { background-color: #1A1A1A; padding: 24px 32px; text-align: center; }
  .header-logo { color: #ffffff; font-family: Georgia, serif; font-size: 20px; font-weight: bold; text-decoration: none; }
  .content { padding: 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1A1A1A; line-height: 1.6; }
  .content h1 { font-family: Georgia, serif; font-size: 24px; margin: 0 0 24px 0; color: #1A1A1A; }
  .content p { margin: 0 0 16px 0; font-size: 15px; }
  .highlight-box { background-color: #f8f8f8; border-left: 4px solid #C8102E; padding: 16px 20px; margin: 24px 0; }
  .highlight-box strong { color: #C8102E; }
  .case-number { font-size: 20px; font-weight: bold; color: #C8102E; }
  .button { display: inline-block; background-color: #C8102E; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 15px; margin: 16px 0; }
  .footer { background-color: #f5f5f5; padding: 24px 32px; text-align: center; font-size: 13px; color: #6B6B6B; }
  .footer a { color: #6B6B6B; }
  .divider { height: 1px; background-color: #e5e5e5; margin: 24px 0; }
  .info-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
  .info-table td { padding: 8px 0; font-size: 14px; vertical-align: top; }
  .info-table td:first-child { color: #6B6B6B; width: 140px; }
  .info-table td:last-child { font-weight: 500; }
`;

function emailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${emailStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="header-logo">AccountHilfe.de</span>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>DR. SARAFI Rechtsanwaltsgesellschaft mbH</p>
      <p>Leerbachstraße 54 · 60322 Frankfurt am Main</p>
      <p><a href="https://accounthilfe.de">accounthilfe.de</a></p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function mandantConfirmationEmail(
  caseNumber: string,
  vorname: string,
  nachname: string,
  platform: string,
  nutzername: string
) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://accounthilfe.de";

  const content = `
    <h1>Ihr Fall wurde erfolgreich erstellt</h1>

    <p>Sehr geehrte/r ${vorname} ${nachname},</p>

    <p>vielen Dank für Ihr Vertrauen. Ihr Fall wurde erfolgreich angelegt und wird nun von uns bearbeitet.</p>

    <div class="highlight-box">
      <p style="margin: 0;"><strong>Ihre Fallnummer:</strong></p>
      <p class="case-number" style="margin: 8px 0 0 0;">${caseNumber}</p>
    </div>

    <table class="info-table">
      <tr>
        <td>Plattform:</td>
        <td>${platform}</td>
      </tr>
      <tr>
        <td>Nutzername:</td>
        <td>${nutzername}</td>
      </tr>
    </table>

    <div class="divider"></div>

    <p><strong>Was passiert als Nächstes?</strong></p>
    <p>Ihr anwaltliches Schreiben wird zeitnah erstellt und an die Plattform versendet. Wir halten Sie über den Fortschritt Ihres Falls auf dem Laufenden.</p>

    <p>Sie können den Status Ihres Falls jederzeit online abrufen:</p>

    <a href="${baseUrl}/mein-fall" class="button">Fallstatus abrufen</a>

    <p style="font-size: 13px; color: #6B6B6B;">Halten Sie dazu Ihre Fallnummer und E-Mail-Adresse bereit.</p>

    <div class="divider"></div>

    <p>Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>

    <p>Mit freundlichen Grüßen,<br>
    <strong>Ihr Team von AccountHilfe.de</strong></p>
  `;

  return {
    subject: `Ihr Fall ${caseNumber} wurde erfolgreich erstellt – AccountHilfe.de`,
    html: emailWrapper(content),
  };
}

export interface AdminEmailData {
  caseNumber: string;
  vorname: string;
  nachname: string;
  email: string;
  telefon?: string;
  strasse: string;
  plz: string;
  stadt: string;
  platform: string;
  nutzername: string;
  registrierteEmail: string;
  sperrDatum: string;
  sperrGrund: string;
  kontotyp: string;
  track: string;
  paymentMethod: string;
  gewerbBeschreibung?: string;
  followerCount?: string;
  monatlicheEinnahmen?: string;
}

export function adminNewCaseEmail(data: AdminEmailData) {
  const kontotypLabel = data.kontotyp === "GEWERBLICH" ? "Gewerblich" : "Privat";
  const trackLabel = data.track === "A_INJUNCTION" ? "Track A (Einstweilige Verfügung)" : "Track B (Klage)";
  const paymentLabel = data.paymentMethod === "STRIPE" ? "Stripe (Karte/SEPA)" : "PayPal";

  const content = `
    <h1>Neue Anfrage eingegangen</h1>

    <div class="highlight-box">
      <p style="margin: 0;"><strong>Fallnummer:</strong></p>
      <p class="case-number" style="margin: 8px 0 0 0;">${data.caseNumber}</p>
    </div>

    <p><strong>Mandant</strong></p>
    <table class="info-table">
      <tr>
        <td>Name:</td>
        <td>${data.vorname} ${data.nachname}</td>
      </tr>
      <tr>
        <td>E-Mail:</td>
        <td><a href="mailto:${data.email}">${data.email}</a></td>
      </tr>
      ${data.telefon ? `<tr><td>Telefon:</td><td>${data.telefon}</td></tr>` : ""}
      <tr>
        <td>Adresse:</td>
        <td>${data.strasse}, ${data.plz} ${data.stadt}</td>
      </tr>
    </table>

    <div class="divider"></div>

    <p><strong>Falldaten</strong></p>
    <table class="info-table">
      <tr>
        <td>Plattform:</td>
        <td>${data.platform}</td>
      </tr>
      <tr>
        <td>Nutzername:</td>
        <td>${data.nutzername}</td>
      </tr>
      <tr>
        <td>Registrierte E-Mail:</td>
        <td>${data.registrierteEmail}</td>
      </tr>
      <tr>
        <td>Sperrdatum:</td>
        <td>${data.sperrDatum}</td>
      </tr>
      <tr>
        <td>Sperrgrund:</td>
        <td>${data.sperrGrund}</td>
      </tr>
    </table>

    <div class="divider"></div>

    <p><strong>Kontotyp & Verfahren</strong></p>
    <table class="info-table">
      <tr>
        <td>Kontotyp:</td>
        <td><strong style="color: ${data.kontotyp === "GEWERBLICH" ? "#C8102E" : "#1A1A1A"};">${kontotypLabel}</strong></td>
      </tr>
      <tr>
        <td>Track:</td>
        <td>${trackLabel}</td>
      </tr>
      <tr>
        <td>Zahlung:</td>
        <td>${paymentLabel}</td>
      </tr>
    </table>

    ${data.kontotyp === "GEWERBLICH" ? `
    <div class="divider"></div>

    <p><strong>Gewerbliche Details</strong></p>
    <table class="info-table">
      ${data.gewerbBeschreibung ? `<tr><td>Beschreibung:</td><td>${data.gewerbBeschreibung}</td></tr>` : ""}
      ${data.followerCount ? `<tr><td>Follower:</td><td>${data.followerCount}</td></tr>` : ""}
      ${data.monatlicheEinnahmen ? `<tr><td>Monatl. Einnahmen:</td><td>${data.monatlicheEinnahmen}</td></tr>` : ""}
    </table>
    ` : ""}

    <div class="divider"></div>

    <p>Bitte den Fall im Admin-Dashboard bearbeiten.</p>
  `;

  return {
    subject: `Neue Anfrage ${data.caseNumber} – ${data.vorname} ${data.nachname} (${data.platform})`,
    html: emailWrapper(content),
  };
}

export function deadlineReminderEmail(
  caseNumber: string,
  tageVerbleibend: number,
  fristDatum: string
) {
  const content = `
    <h1>Fristüberwachung</h1>

    <div class="highlight-box">
      <p style="margin: 0;"><strong>Fall ${caseNumber}</strong></p>
      <p style="margin: 8px 0 0 0;">Die Frist läuft in <strong>${tageVerbleibend} Tag${tageVerbleibend === 1 ? "" : "en"}</strong> ab.</p>
    </div>

    <table class="info-table">
      <tr>
        <td>Fallnummer:</td>
        <td>${caseNumber}</td>
      </tr>
      <tr>
        <td>Fristende:</td>
        <td><strong>${fristDatum}</strong></td>
      </tr>
    </table>

    <p>Sollte die Plattform bis dahin nicht reagiert haben, werden wir die nächsten rechtlichen Schritte einleiten.</p>

    <p>Mit freundlichen Grüßen,<br>
    <strong>Ihr Team von AccountHilfe.de</strong></p>
  `;

  return {
    subject: `Fristablauf in ${tageVerbleibend} Tag${tageVerbleibend === 1 ? "" : "en"} – Fall ${caseNumber}`,
    html: emailWrapper(content),
  };
}

export function deadlineExpiredEmail(
  caseNumber: string,
  nextStep: string
) {
  const content = `
    <h1 style="color: #C8102E;">Frist abgelaufen</h1>

    <div class="highlight-box" style="border-color: #C8102E; background-color: #fff5f5;">
      <p style="margin: 0;"><strong>Fall ${caseNumber}</strong></p>
      <p style="margin: 8px 0 0 0;">Die gesetzte Frist ist abgelaufen.</p>
    </div>

    <table class="info-table">
      <tr>
        <td>Fallnummer:</td>
        <td>${caseNumber}</td>
      </tr>
      <tr>
        <td>Nächster Schritt:</td>
        <td><strong>${nextStep}</strong></td>
      </tr>
    </table>

    <p>Wir werden uns in Kürze bei Ihnen melden, um die weiteren Schritte zu besprechen.</p>

    <p>Mit freundlichen Grüßen,<br>
    <strong>Ihr Team von AccountHilfe.de</strong></p>
  `;

  return {
    subject: `Frist abgelaufen – Nächste Schritte – Fall ${caseNumber}`,
    html: emailWrapper(content),
  };
}
