import nodemailer from "nodemailer";
import ExpressError from "../utils/ExpressError.js";

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const user = process.env.EMAIL_USER || "eventifyadmin@gmail.com";
  const pass = process.env.EMAIL_PASS || "tvxsghsqtvflczme";

  console.log("DEBUG: V3 - Initializing SMTP with user:", user);

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
    family: 4, // Force IPv4 to fix Render ENETUNREACH
    connectionTimeout: 30000,
  });

  transporter.verify((error) => {
    if (error) {
      console.error("❌ DEBUG: SMTP Verification Failed:", error);
    } else {
      console.log("✅ DEBUG: SMTP Connection Ready.");
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
    console.error("❌ DEBUG: Booking Mail Error:", error);
    throw new ExpressError(500, "Failed to send booking email");
  }
};

const sendOTPEmail = async (userEmail, otp, type) => {
  if (!userEmail) throw new ExpressError(400, "Email is required");
  const mailTransporter = getTransporter();

  const title = type === "account_verification" ? "Verify Account" : "Booking Verification";

  try {
    const sender = process.env.EMAIL_USER || "eventifyadmin@gmail.com";
    console.log(`DEBUG: Sending OTP to ${userEmail} via ${sender}`);
    
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
    console.log("✅ DEBUG: OTP Mail Sent Successfully");
  } catch (error) {
    console.error("❌ DEBUG: OTP Mail Error Details:", error);
    throw new ExpressError(500, "Failed to send OTP email");
  }
};

export { sendBookingEmail, sendOTPEmail };
