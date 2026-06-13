import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otp: {
      type: String,
      required: true, 
    },
    action: {
      type: String,
      enum: ["account_verification", "event_booking"],
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 300, 
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;