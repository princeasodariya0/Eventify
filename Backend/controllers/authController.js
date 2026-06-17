import User from "../models/User.js";
import OTP from "../models/OTP.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import ExpressError from "../utils/ExpressError.js";
import { sendOTPEmail } from "../utils/email.js";

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
};

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ExpressError(400, "User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: "user",
    isVerified: false,
  });

  const otp = generateOTP();
  const hashedOTP = await bcrypt.hash(otp, 10);

  await OTP.findOneAndDelete({
    email: user.email,
    action: "account_verification",
  });

  await OTP.create({
    email,
    otp: hashedOTP,
    action: "account_verification",
  });

  let emailSent = true;
  let emailErrorMsg = "";

  // Send OTP email
  try {
    await sendOTPEmail(
      email,
      otp,
      "account_verification"
    );
  } catch (emailError) {
    emailSent = false;
    emailErrorMsg = emailError.message;
    console.error("⚠️ Failed to send OTP email:", emailErrorMsg);
  }

  res.status(201).json({
    success: true,
    message: emailSent 
      ? "OTP sent to email. Please verify." 
      : "Account created! OTP email failed to send (check backend console for OTP).",
    email: user.email,
    emailSent: emailSent,
    emailError: emailErrorMsg
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select(
    "+password"
  );

  if (!user) {
    throw new ExpressError(
      400,
      "Invalid credentials"
    );
  }

  const isMatch = await bcrypt.compare(
    password,
    user.password
  );

  if (!isMatch) {
    throw new ExpressError(
      400,
      "Invalid credentials"
    );
  }

  if (!user.isVerified && user.role !== "admin") {
    const otp = generateOTP();
    const hashedOTP = await bcrypt.hash(otp, 10);

    await OTP.findOneAndDelete({
      email: user.email,
      action: "account_verification",
    });

    await OTP.create({
      email: user.email,
      otp: hashedOTP,
      action: "account_verification",
    });

    let emailSent = true;
    let emailErrorMsg = "";

    // Send OTP email, but don't block if it fails
    try {
      await sendOTPEmail(
        user.email,
        otp,
        "account_verification"
      );
    } catch (emailError) {
      emailSent = false;
      emailErrorMsg = emailError.message;
      console.error("⚠️ Failed to send OTP email:", emailErrorMsg);
      // For testing: log OTP to console
      console.log(`🔑 TEST OTP for ${user.email}: ${otp}`);
    }

    return res.status(403).json({
      success: false,
      message: emailSent 
        ? "Account not verified" 
        : "Account not verified! OTP email failed to send (check backend console for OTP).",
      needsVerification: true,
      email: user.email,
      emailSent: emailSent,
      emailError: emailErrorMsg
    });
  }

  res.json({
    success: true,
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(
      user._id,
      user.role
    ),
  });
};

export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  const validOTP = await OTP.findOne({
    email,
    action: "account_verification",
  });

  if (!validOTP) {
    throw new ExpressError(
      400,
      "Invalid or expired OTP"
    );
  }

  const isValid = await bcrypt.compare(
    otp,
    validOTP.otp
  );

  if (!isValid) {
    throw new ExpressError(
      400,
      "Invalid or expired OTP"
    );
  }

  const user = await User.findOneAndUpdate(
    { email },
    { isVerified: true },
    { new: true }
  );

  await OTP.deleteOne({
    _id: validOTP._id,
  });

  res.json({
    success: true,
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(
      user._id,
      user.role
    ),
  });
};