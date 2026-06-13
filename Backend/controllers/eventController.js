import Event from "../models/Event.js";
import ExpressError from "../utils/ExpressError.js";

export const getEvents = async (req, res) => {
  const events = await Event.find().populate(
    "createdBy",
    "name email"
  );

  if (req.query.search) {
    const filteredEvents = events.filter((event) =>
      event.title
        .toLowerCase()
        .includes(req.query.search.toLowerCase())
    );

    return res.send(filteredEvents);
  }

  if (req.query.category) {
    const filteredEvents = events.filter(
      (event) =>
        event.category === req.query.category
    );

    return res.send(filteredEvents);
  }

  if (events.length === 0) {
    return res.status(200).json({
      success: true,
      events: [],
    });
  }

  res.send(events)
};

export const getEventById = async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate("createdBy", "name email");

  if (!event) {
    throw new ExpressError(404, "Event not found");
  }

  res.json({
    success: true,
    event,
  });
};

export const createEvent = async (req, res) => {
  const {
    title,
    description,
    date,
    location,
    category,
    totalSeats,
    ticketPrice,
    image,
  } = req.body;

  if (new Date(date) < new Date()) {
    throw new ExpressError(
      400,
      "Event date must be in the future"
    );
  }

  const event = await Event.create({
    title,
    description,
    date,
    location,
    category,
    totalSeats,
    availableSeats: totalSeats,
    ticketPrice: ticketPrice || 0,
    image: image || "",
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: "Event created successfully",
    event,
  });
};

export const updateEvent = async (req, res) => {
  const event = await Event.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!event) {
    throw new ExpressError(404, "Event not found");
  }

  res.json({
    success: true,
    message: "Event updated successfully",
    event,
  });
};

export const deleteEvent = async (req, res) => {
  const event = await Event.findByIdAndDelete(
    req.params.id
  );

  if (!event) {
    throw new ExpressError(404, "Event not found");
  }

  res.json({
    success: true,
    message: "Event deleted successfully",
  });
};