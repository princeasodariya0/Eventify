import nodemailer from "nodemailer";
import ExpressError from "../utils/ExpressError.js";

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  const user = process.env.EMAIL_USER || "eventifyadmin@gmail.com";
  const pass = process.env.EMAIL_PASS || "tvxsghsqtvflczme";

  console.log("DEBUG: V10 - Initializing SMTP (Port 587 + IPv4 Force) with user:", user);

  try {
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // Port 587 uses STARTTLS
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false,
        servername: "smtp.gmail.com"
      },
      // Force IPv4 to avoid Render's IPv6 ENETUNREACH issues
      family: 4,
      connectionTimeout: 20000,
      greetingTimeout: 20000,
      socketTimeout: 30000,
    });

    // Note: We skip full .verify() here and try sending directly to avoid timeout loops on initialization
    return transporter;
  } catch (error) {
    console.error("❌ DEBUG: V10 SMTP Initialization Failed:", error.message);
    transporter = null;
    return null;
  }
};

const sendBookingEmail = async (userEmail, userName, eventTitle) => {
  if (!userEmail) throw new ExpressError(400, "Email is required");
  const mailTransporter = await getTransporter();
  if (!mailTransporter) throw new ExpressError(500, "Mail service unavailable");
  
  try {
    const sender = process.env.EMAIL_USER || "eventifyadmin@gmail.com";
    await mailTransporter.sendMail({
      from: `"Eventify Team" <${sender}>`,
      to: userEmail,
      subject: `Booking Confirmed: ${eventTitle}`,
      html: `<h1>Confirmed!</h1><p>Hi ${userName}, your booking for ${eventTitle} is ready.</p>`,
    });
  } catch (error) {
    console.error("❌ DEBUG: V10 Booking Mail Error:", error);
    throw new ExpressError(500, "Failed to send booking email");
  }
};

const sendOTPEmail = async (userEmail, otp, type) => {
  if (!userEmail) throw new ExpressError(400, "Email is required");
  const mailTransporter = await getTransporter();
  if (!mailTransporter) throw new ExpressError(500, "Mail service unavailable");

  const title = type === "account_verification" ? "Verify Account" : "Booking Verification";

  try {
    const sender = process.env.EMAIL_USER || "eventifyadmin@gmail.com";
    console.log(`DEBUG: V10 Sending OTP to ${userEmail} via ${sender}`);
    
    await mailTransporter.sendMail({
      from: `"Eventify Team" <${sender}>`,
      to: userEmail,
      subject: title,
      html: `<div style="font-family:sans-serif;padding:20px;">
        <h2>${title}</h2>
        <p>Your OTP code is:</p>
        <h1 style="letter-spacing:5px;">${otp}</h1>
      </div>`,
    });
    console.log("✅ DEBUG: V10 OTP Mail Sent Successfully");
  } catch (error) {
    console.error("❌ DEBUG: V10 OTP Mail Error Details:", error);
    // If it fails once, reset transporter to force fresh connection next time
    transporter = null;
    throw new ExpressError(500, "Failed to send OTP email");
  }
};

export { sendBookingEmail, sendOTPEmail };
