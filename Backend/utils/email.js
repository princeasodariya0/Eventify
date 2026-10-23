import nodemailer from "nodemailer";
import ExpressError from "../utils/ExpressError.js";
import dns from "dns";
import { promisify } from "util";

const lookup = promisify(dns.lookup);

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  const user = process.env.EMAIL_USER || "eventifyadmin@gmail.com";
  const pass = process.env.EMAIL_PASS || "tvxsghsqtvflczme";

  try {
    // V7: Use Port 587 instead of 465, because cloud providers often block 465 but allow 587.
    const { address } = await lookup("smtp.gmail.com", { family: 4 });
    console.log(`DEBUG: V7 - Resolved smtp.gmail.com to IPv4: ${address} | Using Port 587`);

    transporter = nodemailer.createTransport({
      host: address,
      port: 587,
      secure: false, // Port 587 is STARTTLS
      auth: { user, pass },
      tls: {
        servername: "smtp.gmail.com",
        rejectUnauthorized: false
      },
      connectionTimeout: 40000,
      greetingTimeout: 40000,
      socketTimeout: 60000,
    });

    await transporter.verify();
    console.log("✅ DEBUG: V7 SMTP Connection Ready.");
    return transporter;
  } catch (error) {
    console.error("❌ DEBUG: V7 SMTP Initialization Failed:", error.message);
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
    console.error("❌ DEBUG: V7 Booking Mail Error:", error);
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
    console.log(`DEBUG: V7 Sending OTP to ${userEmail} via ${sender}`);
    
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
    console.log("✅ DEBUG: V7 OTP Mail Sent Successfully");
  } catch (error) {
    console.error("❌ DEBUG: V7 OTP Mail Error Details:", error);
    throw new ExpressError(500, "Failed to send OTP email");
  }
};

export { sendBookingEmail, sendOTPEmail };
