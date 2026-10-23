import ExpressError from "../utils/ExpressError.js";

// Brevo HTTP API (HTTPS/443) is used instead of SMTP because cloud hosts like
// Render block outbound SMTP ports (25, 465, 587), which caused ETIMEDOUT.

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

const sendEmail = async (to, subject, html) => {
  const apiKey = process.env.BREVO_API_KEY;
  const sender = process.env.EMAIL_USER;

  if (!apiKey || !sender) {
    console.error(
      "❌ Missing email env vars (BREVO_API_KEY, EMAIL_USER)"
    );
    throw new ExpressError(500, "Mail service unavailable");
  }

  const response = await fetch(BREVO_ENDPOINT, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: "Eventify Team", email: sender },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Brevo API ${response.status}: ${detail}`);
  }
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
