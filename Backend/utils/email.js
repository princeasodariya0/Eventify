import nodemailer from "nodemailer";
import ExpressError from "../utils/ExpressError.js";

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const user = process.env.EMAIL_USER || "eventifyadmin@gmail.com";
  const pass = process.env.EMAIL_PASS || "tvxsghsqtvflczme";

  console.log("DEBUG: V4 - Initializing SMTP (Forcing IPv4 and Port 587) with user:", user);

  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Port 587 uses STARTTLS
    auth: { user, pass },
    family: 4, // CRITICAL: Force IPv4 to fix Render ENETUNREACH
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
    tls: {
      // Do not fail on invalid certs
      rejectUnauthorized: false,
      // Ensure we only use IPv4 for the TLS connection too
      servername: "smtp.gmail.com"
    }
  });

  transporter.verify((error) => {
    if (error) {
      console.error("❌ DEBUG: V4 SMTP Verification Failed:", error);
    } else {
      console.log("✅ DEBUG: V4 SMTP Connection Ready.");
    }
  });

  return transporter;
};

const sendBookingEmail = async (userEmail, userName, eventTitle) => {
  if (!userEmail) throw new ExpressError(400, "Email is required");
  const mailTransporter = getTransporter();
  
  try {
    const sender = process.env.EMAIL_USER || "eventifyadmin@gmail.com";
    await mailTransporter.sendMail({
      from: `"Eventify Team" <${sender}>`,
      to: userEmail,
      subject: `Booking Confirmed: ${eventTitle}`,
      html: `<h1>Confirmed!</h1><p>Hi ${userName}, your booking for ${eventTitle} is ready.</p>`,
    });
  } catch (error) {
    console.error("❌ DEBUG: V4 Booking Mail Error:", error);
    throw new ExpressError(500, "Failed to send booking email");
  }
};

const sendOTPEmail = async (userEmail, otp, type) => {
  if (!userEmail) throw new ExpressError(400, "Email is required");
  const mailTransporter = getTransporter();

  const title = type === "account_verification" ? "Verify Account" : "Booking Verification";

  try {
    const sender = process.env.EMAIL_USER || "eventifyadmin@gmail.com";
    console.log(`DEBUG: V4 Sending OTP to ${userEmail} via ${sender}`);
    
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
    console.log("✅ DEBUG: V4 OTP Mail Sent Successfully");
  } catch (error) {
    console.error("❌ DEBUG: V4 OTP Mail Error Details:", error);
    throw new ExpressError(500, "Failed to send OTP email");
  }
};

export { sendBookingEmail, sendOTPEmail };
