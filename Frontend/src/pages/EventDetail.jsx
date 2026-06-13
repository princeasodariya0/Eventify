import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/axios";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaChair,
  FaMoneyBillWave,
} from "react-icons/fa";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [showOTP, setShowOTP] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/events/${id}`);
        setEvent(res.data.event);
      } catch (err) {
        toast.error(err.response?.data?.message || "Event does not exist");
        navigate("/");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleBooking = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setBookingLoading(true);

    try {
      if (!showOTP) {
        const res = await api.post("/bookings/send-otp");
        setShowOTP(true);
        toast.success(res.data?.message || "OTP sent to your email.");
      } else {
        const res = await api.post("/bookings", {
          eventId: event._id,
          otp,
        });

        toast.success(res.data?.message || "Booking requested successfully!");
        setShowOTP(false);
        setEvent((prev) => ({
          ...prev,
          availableSeats: prev.availableSeats - 1,
        }));
        navigate("/payment-success");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed");
      navigate("/payment-failed");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <h2 className="text-center mt-10 text-lg">Loading...</h2>;

  if (!event)
    return (
      <h2 className="text-center mt-10 text-red-500 text-lg">
        Event not found
      </h2>
    );

  const isSoldOut = event.availableSeats <= 0;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden mt-4 sm:mt-8 mx-2 sm:mx-0">
      {event.image ? (
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-48 sm:h-80 object-cover"
        />
      ) : (
        <div className="w-full h-40 sm:h-64 bg-gray-900 flex items-center justify-center text-white/50 text-3xl sm:text-6xl font-black uppercase tracking-widest">
          {event.category}
        </div>
      )}

      <div className="p-5 sm:p-8 md:p-12">
        <div className="flex flex-col gap-6">
          <div>
            <div className="inline-block bg-gray-200 text-gray-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-3">
              {event.category}
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              {event.title}
            </h1>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed">
              {event.description}
            </p>
          </div>

          <div className="bg-gray-50 p-5 sm:p-6 rounded-xl border border-gray-100 w-full shadow-sm">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-5">
              Booking Details
            </h3>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 sm:gap-4 text-gray-600">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-900 shrink-0">
                  <FaMoneyBillWave />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-400 uppercase">
                    Ticket Price
                  </p>
                  <p className="font-bold text-gray-800 text-sm sm:text-base md:text-lg">
                    {event.ticketPrice === 0 ? (
                      <span className="text-green-500">Free</span>
                    ) : (
                      `₹${event.ticketPrice}`
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-4 text-gray-600">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-900 shrink-0">
                  <FaChair />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-400 uppercase">
                    Availability
                  </p>
                  <p className="font-bold text-gray-800 text-sm sm:text-base">
                    <span
                      className={
                        event.availableSeats < 10 ? "text-orange-500" : ""
                      }
                    >
                      {event.availableSeats}
                    </span>{" "}
                    / {event.totalSeats}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-4 text-gray-600">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-900 shrink-0">
                  <FaCalendarAlt />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-400 uppercase">
                    Date
                  </p>
                  <p className="font-bold text-gray-800 text-sm sm:text-base">
                    {new Date(event.date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-4 text-gray-600">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-900 shrink-0">
                  <FaMapMarkerAlt />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-400 uppercase">
                    Location
                  </p>
                  <p className="font-bold text-gray-800 text-sm sm:text-base">{event.location}</p>
                </div>
              </div>
            </div>

            {showOTP && (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Enter OTP to Confirm
                </label>
                <input
                  type="text"
                  required
                  placeholder="6-digit code"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gray-700 transition shadow-sm font-bold tracking-widest text-center text-sm sm:text-base md:text-lg"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength="6"
                />
              </div>
            )}

            <button
              onClick={handleBooking}
              disabled={isSoldOut || bookingLoading || (showOTP && !otp)}
              className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-bold text-sm sm:text-base md:text-lg transition shadow-lg ${
                isSoldOut
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gray-900 hover:bg-black text-white hover:shadow-xl hover:-translate-y-1"
              }`}
            >
              {bookingLoading
                ? "Processing..."
                : showOTP
                  ? "Verify OTP & Confirm"
                  : isSoldOut
                    ? "Sold Out"
                    : "Confirm Registration"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
