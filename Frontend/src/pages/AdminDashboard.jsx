import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/axios";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showEventForm, setShowEventForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    category: "",
    totalSeats: "",
    ticketPrice: "",
    image: "",
  });

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/login");
      return;
    }
    fetchData().finally(() => setLoading(false));
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const eventsRes = await api.get("/api/events");
      const bookingsRes = await api.get("/api/bookings/my");

      setEvents(eventsRes.data.events || []);
      setBookings(bookingsRes.data.bookings || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error loading dashboard data");
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/events", formData);
      toast.success(res.data?.message || "Event created successfully!");
      setShowEventForm(false);
      setFormData({
        title: "",
        description: "",
        date: "",
        location: "",
        category: "",
        totalSeats: "",
        ticketPrice: "",
        image: "",
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating event");
    }
  };

  const handleDeleteEvent = async (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        const res = await api.delete(`/api/events/${id}`);
        toast.success(res.data?.message || "Event deleted successfully!");
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || "Error deleting event");
      }
    }
  };

  const handleConfirmBooking = async (id, paymentStatus) => {
    try {
      const res = await api.put(`/api/bookings/${id}/confirm`, { paymentStatus });
      toast.success(res.data?.message || "Booking confirmed successfully!");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error confirming booking");
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm("Cancel this user's booking request?")) return;

    try {
      const res = await api.delete(`/api/bookings/${id}`);
      toast.success(res.data.message);
      await fetchData();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Error cancelling booking"
      );
    }
  };

  if (loading)
    return (
      <div className="text-center py-16 sm:py-20 text-lg font-semibold">
        Loading admin panel...
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 mb-6 sm:mb-8 shadow-lg flex flex-col justify-between items-center gap-5 text-center">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-200 text-sm sm:text-base">
            Manage events and manually confirm bookings.
          </p>
        </div>
        <button
          onClick={() => setShowEventForm(!showEventForm)}
          className="w-full sm:w-auto bg-white text-purple-700 font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg hover:bg-pink-50 transition shadow-md text-sm sm:text-base"
        >
          {showEventForm ? "Cancel Creation" : "+ Create New Event"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white p-5 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-xs sm:text-sm font-bold uppercase tracking-wider mb-1">
              Total Revenue
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-green-600">
              ₹
              {bookings.reduce(
                (sum, b) =>
                  b.paymentStatus === "paid" && b.status === "confirmed"
                    ? sum + b.amount
                    : sum,
                0
              )}
            </h3>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-indigo-100 to-purple-100 text-purple-600 rounded-full flex items-center justify-center text-lg sm:text-xl font-bold">
            ₹
          </div>
        </div>
        <div className="bg-white p-5 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-xs sm:text-sm font-bold uppercase tracking-wider mb-1">
              Paid Clients
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-blue-600">
              {
                new Set(
                  bookings
                    .filter(
                      (b) =>
                        b.paymentStatus === "paid" && b.status === "confirmed"
                    )
                    .map((b) => b.userId?._id)
                ).size
              }
            </h3>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-100 to-pink-100 text-pink-600 rounded-full flex items-center justify-center text-lg sm:text-xl font-bold">
            👤
          </div>
        </div>
        <div className="bg-white p-5 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-xs sm:text-sm font-bold uppercase tracking-wider mb-1">
              Pending Requests
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-yellow-600">
              {bookings.filter((b) => b.status === "pending").length}
            </h3>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-pink-100 to-red-100 text-red-600 rounded-full flex items-center justify-center text-lg sm:text-xl font-bold">
            ⏳
          </div>
        </div>
      </div>

      {showEventForm && (
        <div className="bg-white p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6 text-gray-800">
            Create New Event
          </h2>
          <form
            onSubmit={handleCreateEvent}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
          >
            <input
              required
              type="text"
              placeholder="Event Title"
              className="border border-gray-200 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition text-sm sm:text-base"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
            <input
              required
              type="text"
              placeholder="Category (e.g., Tech, Music)"
              className="border border-gray-200 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition text-sm sm:text-base"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            />
            <input
              required
              type="date"
              className="border border-gray-200 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition text-sm sm:text-base"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
            />
            <input
              required
              type="text"
              placeholder="Location"
              className="border border-gray-200 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition text-sm sm:text-base"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
            />
            <input
              required
              type="number"
              placeholder="Total Seats"
              className="border border-gray-200 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition text-sm sm:text-base"
              value={formData.totalSeats}
              onChange={(e) =>
                setFormData({ ...formData, totalSeats: e.target.value })
              }
            />
            <input
              required
              type="number"
              placeholder="Ticket Price (0 for free)"
              className="border border-gray-200 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition text-sm sm:text-base"
              value={formData.ticketPrice}
              onChange={(e) =>
                setFormData({ ...formData, ticketPrice: e.target.value })
              }
            />

            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Image URL (Provide any direct link to an image)"
                className="w-full border border-gray-200 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition text-sm sm:text-base"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
              />
            </div>

            <textarea
              required
              placeholder="Event Description"
              className="border border-gray-200 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg md:col-span-2 h-28 sm:h-32 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition text-sm sm:text-base"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
            <button
              type="submit"
              className="md:col-span-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-2.5 sm:py-3 mt-1 sm:mt-2 rounded-lg hover:from-purple-700 hover:to-pink-600 transition shadow-md text-sm sm:text-base"
            >
              Publish Event
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <div className="flex flex-col">
          <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800 flex items-center gap-2 sm:gap-3">
            <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs sm:text-sm">
              {events.length}
            </span>
            All Events
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <ul className="divide-y divide-gray-100 max-h-[500px] sm:max-h-[600px] overflow-y-auto">
              {events.length === 0 ? (
                <li className="p-5 sm:p-6 text-gray-500 text-center text-sm sm:text-base">
                  No events created yet.
                </li>
              ) : (
                events.map((event) => (
                  <li
                    key={event._id}
                    className="p-4 sm:p-5 flex flex-col justify-between items-start gap-3 hover:bg-purple-50 transition border-b border-gray-100 last:border-0"
                  >
                    <div className="w-full">
                      <h4 className="font-bold text-gray-900 mb-1 leading-tight text-sm sm:text-base">
                        {event.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500">
                        <span className="flex items-center gap-1 font-medium">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-500"></div>{" "}
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1 font-medium">
                          <div
                            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${event.availableSeats > 0 ? "bg-green-500" : "bg-red-500"}`}
                          ></div>{" "}
                          {event.availableSeats}/{event.totalSeats} seats
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteEvent(event._id)}
                      className="w-full sm:w-auto text-red-500 hover:text-white hover:bg-red-500 border border-red-200 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition shadow-sm shrink-0"
                    >
                      Delete
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        <div className="flex flex-col">
          <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800 flex items-center gap-2 sm:gap-3">
            <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs sm:text-sm font-bold">
              {bookings.length}
            </span>
            Booking Requests
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <ul className="divide-y divide-gray-100 max-h-[500px] sm:max-h-[600px] overflow-y-auto">
              {bookings.length === 0 ? (
                <li className="p-5 sm:p-6 text-gray-500 text-center text-sm sm:text-base">
                  No bookings yet.
                </li>
              ) : (
                bookings.map((booking) => (
                  <li
                    key={booking._id}
                    className={`p-4 sm:p-6 hover:bg-purple-50 transition border-l-4 ${booking.status === "pending" ? "border-l-yellow-400" : booking.status === "confirmed" ? "border-l-green-400" : "border-l-red-400"}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-gray-900 text-base sm:text-lg leading-tight flex-1 mr-2">
                        {booking.eventId?.title || "Deleted Event"}
                      </h4>
                      <div className="flex flex-col gap-1 items-end shrink-0">
                        <span
                          className={`px-2 py-1 text-[10px] font-black rounded uppercase tracking-wider ${booking.status === "confirmed" ? "bg-green-100 text-green-700" : booking.status === "cancelled" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}
                        >
                          {booking.status}
                        </span>
                        {booking.status !== "cancelled" && (
                          <span
                            className={`px-2 py-1 text-[10px] font-black rounded uppercase tracking-wider ${booking.paymentStatus === "paid" ? "bg-indigo-100 text-indigo-700" : "bg-gray-200 text-gray-800"}`}
                          >
                            {booking.paymentStatus.replace("_", " ")}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 sm:p-4 mb-3 border border-purple-100 text-xs sm:text-sm">
                      <p className="text-gray-700 flex items-center gap-2 mb-1">
                        <span className="font-bold w-14 sm:w-16 text-gray-500 uppercase text-[10px] sm:text-xs">
                          User:
                        </span>
                        <span className="font-semibold">
                          {booking.userId?.name}
                        </span>
                        <span className="text-gray-400">
                          ({booking.userId?.email})
                        </span>
                      </p>
                      <p className="text-gray-700 flex items-center gap-2 mb-1">
                        <span className="font-bold w-14 sm:w-16 text-gray-500 uppercase text-[10px] sm:text-xs">
                          Amount:
                        </span>
                        <span
                          className={`font-semibold ${booking.amount === 0 ? "text-green-600" : ""}`}
                        >
                          {booking.amount === 0 ? "Free" : `₹${booking.amount}`}
                        </span>
                      </p>
                      <p className="text-gray-700 flex items-center gap-2 mb-1">
                        <span className="font-bold w-14 sm:w-16 text-gray-500 uppercase text-[10px] sm:text-xs">
                          Date:
                        </span>
                        <span>
                          {new Date(booking.bookedAt).toLocaleString()}
                        </span>
                      </p>
                      {booking.eventId && (
                        <p className="text-gray-700 flex items-center gap-2 mt-2 pt-2 border-t border-purple-200">
                          <span className="font-bold w-14 sm:w-16 text-gray-500 uppercase text-[10px] sm:text-xs">
                            Seats:
                          </span>
                          <span
                            className={`font-bold ${booking.eventId.availableSeats > 0 ? "text-green-600" : "text-red-500"}`}
                          >
                            {booking.eventId.availableSeats}
                          </span>{" "}
                          remaining of {booking.eventId.totalSeats}
                        </p>
                      )}
                    </div>

                    {booking.status === "pending" && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        <button
                          onClick={() =>
                            handleConfirmBooking(booking._id, "paid")
                          }
                          className="flex-1 min-w-[100px] sm:min-w-[120px] bg-green-50 text-green-700 hover:bg-green-600 hover:text-white border border-green-200 text-[10px] sm:text-xs font-bold py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg shadow-sm transition"
                        >
                          ✓ Approve as Paid
                        </button>
                        <button
                          onClick={() =>
                            handleConfirmBooking(booking._id, "not_paid")
                          }
                          className="flex-1 min-w-[100px] sm:min-w-[120px] bg-gray-50 text-gray-700 hover:bg-gray-800 hover:text-white border border-gray-200 text-[10px] sm:text-xs font-bold py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg shadow-sm transition"
                        >
                          ✓ Approve Undecided
                        </button>
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          className="w-[70px] sm:w-[80px] bg-red-50 text-red-600 hover:bg-red-500 hover:text-white border border-red-200 text-[10px] sm:text-xs font-bold py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg transition"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    )}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
