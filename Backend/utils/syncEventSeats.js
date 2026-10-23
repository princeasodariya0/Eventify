import Booking from "../models/Booking.js";
import Event from "../models/Event.js";

const ACTIVE_BOOKING_STATUSES = ["pending", "confirmed"];

export const syncEventSeats = async (events) => {
  const eventList = Array.isArray(events)
    ? events.filter(Boolean)
    : events
      ? [events]
      : [];

  if (eventList.length === 0) {
    return events;
  }

  const eventIds = eventList.map((event) => event._id);

  const reservedSeats = await Booking.aggregate([
    {
      $match: {
        eventId: { $in: eventIds },
        status: { $in: ACTIVE_BOOKING_STATUSES },
      },
    },
    {
      $group: {
        _id: "$eventId",
        count: { $sum: 1 },
      },
    },
  ]);

  const reservedSeatsMap = new Map(
    reservedSeats.map((item) => [
      item._id.toString(),
      item.count,
    ])
  );

  const updates = [];

  for (const event of eventList) {
    const reservedCount =
      reservedSeatsMap.get(event._id.toString()) || 0;
    const nextAvailableSeats = Math.max(
      event.totalSeats - reservedCount,
      0
    );

    if (event.availableSeats !== nextAvailableSeats) {
      event.availableSeats = nextAvailableSeats;
      updates.push({
        updateOne: {
          filter: { _id: event._id },
          update: {
            $set: { availableSeats: nextAvailableSeats },
          },
        },
      });
    }
  }

  if (updates.length > 0) {
    await Event.bulkWrite(updates);
  }

  return events;
};
