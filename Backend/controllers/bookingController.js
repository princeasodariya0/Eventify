import Booking from "../models/Booking.js";
import Event from "../models/Event.js";
import OTP from "../models/OTP.js";
import bcrypt from "bcryptjs";
import ExpressError from "../utils/ExpressError.js";
import { sendBookingEmail, sendOTPEmail } from "../utils/email.js";

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const sendBookingOTP = async (req, res) => {
  try {
    const otp = generateOTP();

    await OTP.findOneAndDelete({
      email: req.user.email,
      action: "event_booking",
    });

    const hashedOTP = await bcrypt.hash(otp, 10);

    await OTP.create({
      email: req.user.email,
      otp: hashedOTP,
      action: "event_booking",
    });

    await sendOTPEmail(req.user.email, otp, "event_booking");

    res.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const bookEvent = async (req, res) => {
  const { eventId, otp } = req.body;

  const validOTP = await OTP.findOne({
    email: req.user.email,
    action: "event_booking",
  });

  if (!validOTP) {
    throw new ExpressError(400, "Invalid or expired OTP");
  }

  const isValid = await bcrypt.compare(otp, validOTP.otp);

  if (!isValid) {
    throw new ExpressError(400, "Invalid or expired OTP");
  }

  const event = await Event.findById(eventId);

  if (!event) {
    throw new ExpressError(404, "Event not found");
  }

  if (event.availableSeats <= 0) {
    throw new ExpressError(400, "No seats available");
  }

  const existingBooking = await Booking.findOne({
    userId: req.user._id,
    eventId,
  });

  if (existingBooking && existingBooking.status !== "cancelled") {
    throw new ExpressError(400, "Already booked or pending");
  }

  const booking = await Booking.create({
    userId: req.user._id,
    eventId,
    status: "pending",
    paymentStatus: "not_paid",
    amount: event.ticketPrice,
  });

  await OTP.deleteOne({
    _id: validOTP._id,
  });

  res.status(201).json({
    success: true,
    message: "Booking request submitted",
    booking,
  });
};

export const confirmBooking = async (req, res) => {
  const { paymentStatus } = req.body;

  if (paymentStatus && !["paid", "not_paid"].includes(paymentStatus)) {
    throw new ExpressError(400, "Invalid payment status");
  }

  const booking = await Booking.findById(req.params.id)
    .populate("userId")
    .populate("eventId");

  if (!booking) {
    throw new ExpressError(404, "Booking not found");
  }

  if (booking.status === "confirmed") {
    throw new ExpressError(400, "Booking already confirmed");
  }

  const event = await Event.findById(booking.eventId._id);

  if (!event) {
    throw new ExpressError(404, "Event not found");
  }

  if (event.availableSeats <= 0) {
    throw new ExpressError(400, "No seats available");
  }

  booking.status = "confirmed";

  if (paymentStatus) {
    booking.paymentStatus = paymentStatus;
  }

  await booking.save();

  event.availableSeats -= 1;
  await event.save();

  await sendBookingEmail(
    booking.userId.email,
    booking.userId.name,
    booking.eventId.title,
  );

  res.json({
    success: true,
    message: "Booking confirmed successfully",
    booking,
  });
};

export const getMyBookings = async (req, res) => {
  const bookings =
    req.user.role === "admin"
      ? await Booking.find()
          .populate("eventId")
          .populate("userId", "name email")
          .sort({ createdAt: -1 })
      : await Booking.find({
          userId: req.user._id,
        })
          .populate("eventId")
          .sort({ createdAt: -1 });

  res.json({
    success: true,
    bookings,
  });
};

export const cancelBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    throw new ExpressError(404, "Booking not found");
  }

  if (
    booking.userId.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    throw new ExpressError(403, "Not authorized");
  }

  if (booking.status === "cancelled") {
    throw new ExpressError(400, "Booking already cancelled");
  }

  const wasConfirmed = booking.status === "confirmed";

  booking.status = "cancelled";
  await booking.save();

  if (wasConfirmed) {
    const event = await Event.findById(booking.eventId);

    if (event) {
      event.availableSeats += 1;
      await event.save();
    }
  }

  res.json({
    success: true,
    message: "Booking cancelled successfully",
  });
};
