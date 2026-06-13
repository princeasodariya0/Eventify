import mongoose from "mongoose";
import Booking from "./Booking.js";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    date: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    totalSeats: {
      type: Number,
      required: true,
      min: 1,
    },
    availableSeats: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String,
      default: "",
    },
    ticketPrice: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

eventSchema.pre("save", function () {
  if (this.availableSeats > this.totalSeats) {
    throw new Error(
      "Available seats cannot exceed total seats"
    );
  }
});

eventSchema.post("findOneAndDelete", async (event) => {
  if (event) {
    await Booking.deleteMany({ eventId: event._id });
  }
});

const Event = mongoose.model("Event", eventSchema);

export default Event;