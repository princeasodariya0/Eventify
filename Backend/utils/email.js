import { google } from "googleapis";
import ExpressError from "../utils/ExpressError.js";

// Gmail REST API (HTTPS/443) is used instead of SMTP because cloud hosts like
// Render block outbound SMTP ports (25, 465, 587), which caused ETIMEDOUT.

let gmailClient = null;

const getGmailClient = () => {
  if (gmailClient) return gmailClient;

  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  const user = process.env.EMAIL_USER;

  if (!clientId || !clientSecret || !refreshToken || !user) {
    console.error(
      "❌ Missing Gmail API env vars (GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, EMAIL_USER)"
    );
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  gmailClient = google.gmail({ version: "v1", auth: oauth2Client });
  return gmailClient;
};

const buildRawMessage = (from, to, subject, html) => {
  const mime = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    'Content-Type: text/html; charset="UTF-8"',
    "",
    html,
  ].join("\r\n");

  return Buffer.from(mime).toString("base64url");
};

const sendEmail = async (to, subject, html) => {
  const sender = process.env.EMAIL_USER;
  const gmail = getGmailClient();

  if (!gmail) throw new ExpressError(500, "Mail service unavailable");

  await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: buildRawMessage(`"Eventify Team" <${sender}>`, to, subject, html),
    },
  });
};

const sendBookingEmail = async (userEmail, userName, eventTitle) => {
  if (!userEmail) throw new ExpressError(400, "Email is required");

  try {
    await sendEmail(
      userEmail,
      `Booking Confirmed: ${eventTitle}`,
      `<h1>Confirmed!</h1><p>Hi ${userName}, your booking for ${eventTitle} is ready.</p>`
    );
  } catch (error) {
    console.error("❌ Booking Mail Error:", error.message);
    throw new ExpressError(500, "Failed to send booking email");
  }
};

const sendOTPEmail = async (userEmail, otp, type) => {
  if (!userEmail) throw new ExpressError(400, "Email is required");

  const title =
    type === "account_verification" ? "Verify Account" : "Booking Verification";

  try {
    await sendEmail(
      userEmail,
      title,
      `<div style="font-family:sans-serif;padding:20px;">
        <h2>${title}</h2>
        <p>Your OTP code is:</p>
        <h1 style="letter-spacing:5px;">${otp}</h1>
      </div>`
    );
  } catch (error) {
    console.error("❌ OTP Mail Error:", error.message);
    throw new ExpressError(500, "Failed to send OTP email");
  }
};

export { sendBookingEmail, sendOTPEmail };
