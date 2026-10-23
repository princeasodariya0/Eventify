import nodemailer from "nodemailer";
import ExpressError from "../utils/ExpressError.js";

let transporter = null;

/**
 * Initializes the transporter lazily to ensure environment variables are loaded.
 */
const getTransporter = () => {
  if (transporter) return transporter;

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.error("❌ SMTP credentials missing in environment variables (EMAIL_USER/EMAIL_PASS)");
    return null;
  }

  transporter = nodemailer.createTransport({
    service: "gmail",
    pool: true,
    maxConnections: 3,
    maxMessages: 100,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    auth: { user, pass },
  });

  // Verify connection configuration
  transporter.verify((error) => {
    if (error) {
      console.error("⚠️ SMTP connection failed:", error.message);
    } else {
      console.log("✅ SMTP connection ready.");
    }
  });

  return transporter;
};

const sendBookingEmail = async (userEmail, userName, eventTitle) => {
  if (!userEmail) throw new ExpressError(400, "Email is required");
  if (!eventTitle) throw new ExpressError(400, "Event title is required");

  const mailTransporter = getTransporter();
  if (!mailTransporter) {
    throw new ExpressError(500, "Mail service not configured on server");
  }

  try {
    await mailTransporter.sendMail({
      from: `"Eventify Team" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Booking Confirmed: ${eventTitle}`,
      html: `
        <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Eventify</h1>
            <p style="color: #9ca3af; margin: 8px 0 0 0; font-size: 14px;">Your Event Experience Starts Here</p>
          </div>
          
          <div style="padding: 40px 30px; background: #ffffff; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
            <h2 style="color: #1f2937; margin: 0 0 24px 0; font-size: 24px; font-weight: 700;">Hi ${userName}! 🎉</h2>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.7; margin: 0 0 24px 0;">
              Great news! Your booking for the event <strong style="color: #1f2937;">${eventTitle}</strong> has been successfully confirmed!
            </p>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 24px 0;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                We're excited to see you there! If you have any questions, feel free to reach out to our support team.
              </p>
            </div>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.7; margin: 24px 0 0 0;">
              Thank you for choosing <strong style="color: #1f2937;">Eventify</strong>! We can't wait to make your event experience unforgettable!
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 32px 0;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              &copy; ${new Date().getFullYear()} Eventify. All rights reserved.</p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Booking email error:", error);
    throw new ExpressError(500, "Failed to send booking email");
  }
};

const sendOTPEmail = async (userEmail, otp, type) => {
  if (!userEmail) throw new ExpressError(400, "Email is required");
  if (!otp || otp.length !== 6) throw new ExpressError(400, "Invalid OTP");

  const allowedTypes = ["account_verification", "event_booking"];
  if (!allowedTypes.includes(type)) throw new ExpressError(400, "Invalid OTP type");

  const mailTransporter = getTransporter();
  if (!mailTransporter) {
    throw new ExpressError(500, "Mail service not configured on server");
  }

  const title = type === "account_verification" ? "Verify your Eventify Account" : "Eventify Booking Verification";
  const msg = type === "account_verification" ? "Please use the following OTP to verify your new Eventify account." : "Please use the following OTP to verify and confirm your event booking.";

  try {
    await mailTransporter.sendMail({
      from: `"Eventify Team" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: title,
      html: `
        <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Eventify</h1>
            <p style="color: #9ca3af; margin: 8px 0 0 0; font-size: 14px;">Secure Verification</p>
          </div>
          
          <div style="padding: 40px 30px; background: #ffffff; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
            <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 24px; font-weight: 700;">${title}</h2>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.7; margin: 0 0 32px 0;">${msg}</p>
            
            <div style="background: #f3f4f6; padding: 24px; border-radius: 8px; text-align: center; margin: 0 0 24px 0;">
              <div style="font-size: 36px; font-weight: 700; color: #1f2937; letter-spacing: 12px; margin: 0; font-family: monospace;">${otp}</div>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.7; margin: 0 0 24px 0;">
              <strong style="color: #374151;">Note:</strong> This verification code will expire in <strong>5 minutes</strong>. Do not share this code with anyone else.
            </p>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.7; margin: 24px 0 0 0;">
              If you didn't request this code, please ignore this email or contact our support team immediately.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 32px 0;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              &copy; ${new Date().getFullYear()} Eventify. All rights reserved.</p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("OTP email error:", error);
    throw new ExpressError(500, "Failed to send OTP email");
  }
};

export { sendBookingEmail, sendOTPEmail };
