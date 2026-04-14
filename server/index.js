import "dotenv/config";
import express from "express";
import nodemailer from "nodemailer";
import { Resend } from "resend";

const app = express();
const port = Number(process.env.PORT ?? 8787);
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const configuredProvider = (process.env.EMAIL_PROVIDER ?? "auto").toLowerCase();

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
});

function getNormalizedGmailPassword() {
  return (process.env.GMAIL_APP_PASSWORD ?? "").replace(/\s+/g, "");
}

function createGmailTransport() {
  if (!process.env.GMAIL_USER || !getNormalizedGmailPassword()) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: getNormalizedGmailPassword(),
    },
  });
}

const gmailTransport = createGmailTransport();

function formatDisplayDate(dateString) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${dateString}T12:00:00`));
}

function formatDateTime(dateString) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateString));
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function validateReservation(reservation) {
  if (!reservation || typeof reservation !== "object") {
    return "Reservation payload is required.";
  }

  if (!reservation.email || typeof reservation.email !== "string") {
    return "A guest email address is required.";
  }

  if (!reservation.pin || typeof reservation.pin !== "string") {
    return "A six-digit PIN is required.";
  }

  if (!reservation.fullName || typeof reservation.fullName !== "string") {
    return "Guest name is required.";
  }

  if (!reservation.visitDate || !reservation.startAt || !reservation.endAt) {
    return "Reservation timing details are required.";
  }

  return "";
}

function buildEmailSubject(reservation) {
  return `Hi-Line Resort pass confirmation for ${formatDisplayDate(reservation.visitDate)}`;
}

function buildEmailText(reservation) {
  return [
    `Hi ${reservation.fullName},`,
    "",
    "Your Hi-Line Resort day pass is confirmed.",
    `Confirmation code: ${reservation.confirmationCode}`,
    `Gate PIN: ${reservation.pin}`,
    `Visit date: ${formatDisplayDate(reservation.visitDate)}`,
    `Arrival window: ${reservation.timeSlotLabel}`,
    `Access window: ${formatDateTime(reservation.startAt)} to ${formatDateTime(reservation.endAt)}`,
    `Guests: ${reservation.guestSummary}`,
    `Amount paid: ${formatCurrency(reservation.amountPaid)}`,
    "",
    "Gate entry steps:",
    "1. Walk to the Crappie House gate keypad.",
    "2. Enter the 6-digit PIN above.",
    "3. The lock will activate during your reservation window automatically.",
    "",
    "We look forward to welcoming you to Hi-Line Resort.",
  ].join("\n");
}

function buildEmailHtml(reservation) {
  return `
    <div style="background:#fbf6ef;padding:32px;font-family:Arial,sans-serif;color:#323130;">
      <div style="max-width:640px;margin:0 auto;background:#fffaf4;border:1px solid rgba(50,49,48,0.12);border-radius:24px;overflow:hidden;">
        <div style="padding:28px 28px 20px;background:linear-gradient(135deg,#323130 0%,#88231f 100%);color:#fbf6ef;">
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;">Hi-Line Resort</p>
          <h1 style="margin:0;font-size:30px;line-height:1.1;">Your Crappie House pass is confirmed</h1>
          <p style="margin:14px 0 0;font-size:16px;line-height:1.6;color:rgba(251,246,239,0.82);">
            Your gate details are ready for your visit on ${escapeHtml(formatDisplayDate(reservation.visitDate))}.
          </p>
        </div>
        <div style="padding:28px;">
          <div style="padding:18px 20px;border-radius:18px;background:#ffe0d4;">
            <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#88231f;">Gate PIN</p>
            <p style="margin:0;font-size:36px;font-weight:700;letter-spacing:0.18em;color:#88231f;">
              ${escapeHtml(reservation.pin)}
            </p>
          </div>
          <table style="width:100%;margin-top:20px;border-collapse:collapse;">
            <tbody>
              <tr>
                <td style="padding:10px 0;color:#646260;">Guest</td>
                <td style="padding:10px 0;text-align:right;font-weight:600;">${escapeHtml(reservation.fullName)}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;color:#646260;">Confirmation code</td>
                <td style="padding:10px 0;text-align:right;font-weight:600;">${escapeHtml(reservation.confirmationCode)}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;color:#646260;">Arrival window</td>
                <td style="padding:10px 0;text-align:right;font-weight:600;">${escapeHtml(reservation.timeSlotLabel)}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;color:#646260;">Access window</td>
                <td style="padding:10px 0;text-align:right;font-weight:600;">${escapeHtml(formatDateTime(reservation.startAt))} to ${escapeHtml(formatDateTime(reservation.endAt))}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;color:#646260;">Guests</td>
                <td style="padding:10px 0;text-align:right;font-weight:600;">${escapeHtml(reservation.guestSummary)}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;color:#646260;">Amount paid</td>
                <td style="padding:10px 0;text-align:right;font-weight:600;">${escapeHtml(formatCurrency(reservation.amountPaid))}</td>
              </tr>
            </tbody>
          </table>
          <div style="margin-top:24px;padding:18px 20px;border-radius:18px;background:rgba(106,187,204,0.14);">
            <p style="margin:0 0 10px;font-weight:700;">How to get in</p>
            <ol style="margin:0;padding-left:18px;line-height:1.7;">
              <li>Walk to the Crappie House gate keypad.</li>
              <li>Enter the 6-digit PIN shown above.</li>
              <li>The lock will activate during your reservation window automatically.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  `;
}

function getActiveProvider() {
  if (configuredProvider === "auto") {
    if (gmailTransport) {
      return "gmail";
    }

    if (resend && process.env.RESEND_FROM_EMAIL) {
      return "resend";
    }

    return "unconfigured";
  }

  if (configuredProvider === "gmail") {
    return gmailTransport ? "gmail" : "unconfigured";
  }

  if (configuredProvider === "resend") {
    return resend && process.env.RESEND_FROM_EMAIL ? "resend" : "unconfigured";
  }

  return "unconfigured";
}

function getProviderConfigError() {
  if (configuredProvider === "auto") {
    return getActiveProvider() === "unconfigured"
      ? "No email provider is configured. Add Gmail credentials or Resend credentials to .env."
      : "";
  }

  if (configuredProvider === "gmail") {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      return "Gmail is selected, but GMAIL_USER or GMAIL_APP_PASSWORD is missing from .env.";
    }

    return "";
  }

  if (configuredProvider === "resend") {
    if (!resend || !process.env.RESEND_FROM_EMAIL) {
      return "Resend is selected, but RESEND_API_KEY or RESEND_FROM_EMAIL is missing from .env.";
    }

    return "";
  }

  return "EMAIL_PROVIDER must be auto, gmail, or resend.";
}

async function sendViaGmail(reservation, subject) {
  if (!gmailTransport || !process.env.GMAIL_USER) {
    throw new Error("Gmail transport is not configured.");
  }

  const info = await gmailTransport.sendMail({
    from: `"Hi-Line Resort" <${process.env.GMAIL_USER}>`,
    to: reservation.email,
    subject,
    html: buildEmailHtml(reservation),
    text: buildEmailText(reservation),
    replyTo: process.env.RESEND_REPLY_TO || process.env.GMAIL_USER,
  });

  return {
    status: "queued",
    provider: "gmail",
    emailId: info.messageId ?? "",
    sentTo: reservation.email,
  };
}

async function sendViaResend(reservation, subject) {
  if (!resend || !process.env.RESEND_FROM_EMAIL) {
    throw new Error("Resend is not configured.");
  }

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to: [reservation.email],
    subject,
    html: buildEmailHtml(reservation),
    text: buildEmailText(reservation),
    replyTo: process.env.RESEND_REPLY_TO || undefined,
  });

  if (error) {
    const providerError = new Error("Resend rejected the email send request.");
    providerError.details = error;
    throw providerError;
  }

  return {
    status: "queued",
    provider: "resend",
    emailId: data?.id ?? "",
    sentTo: reservation.email,
  };
}

app.get("/api/health", (_req, res) => {
  const providerError = getProviderConfigError();

  res.status(200).json({
    status: "ok",
    emailConfigured: !providerError,
    provider: getActiveProvider(),
    providerError: providerError || null,
  });
});

app.post("/api/send-access-email", async (req, res) => {
  const { reservation } = req.body ?? {};
  const validationError = validateReservation(reservation);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const providerError = getProviderConfigError();
  if (providerError) {
    return res.status(500).json({ message: providerError });
  }

  const subject = buildEmailSubject(reservation);
  try {
    const activeProvider = getActiveProvider();
    console.log(
      `[email] Attempting ${activeProvider} send for ${reservation.email} (${reservation.confirmationCode})`,
    );
    const result =
      activeProvider === "gmail"
        ? await sendViaGmail(reservation, subject)
        : await sendViaResend(reservation, subject);

    console.log(
      `[email] ${result.provider} accepted email for ${result.sentTo} with id ${result.emailId || "n/a"}`,
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error("[email] send failed", {
      provider: configuredProvider,
      message: error.message,
      details: error.details || error.response || null,
    });
    return res.status(502).json({
      message: error.message || "The email provider rejected the send request.",
      provider: configuredProvider,
      providerError: error.details || error.response || null,
    });
  }
});

app.listen(port, () => {
  console.log(`Hi-Line email server listening on http://localhost:${port}`);
});
