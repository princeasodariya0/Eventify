import express from "express";
import wrapAsync from "../utils/wrapAsync.js";
import {
  bookEvent,
  confirmBooking,
  getMyBookings,
  cancelBooking,
  sendBookingOTP,
} from "../controllers/bookingController.js";

import { protect, admin } from "../middleware/auth.js";

const router = express.Router(); 

router.post('/send-otp', protect, wrapAsync(sendBookingOTP));
router.post('/', protect, wrapAsync(bookEvent));
router.put('/:id/confirm', protect, admin, wrapAsync(confirmBooking));
router.get('/my', protect, wrapAsync(getMyBookings));
router.delete('/:id', protect, wrapAsync(cancelBooking));

export default router;
