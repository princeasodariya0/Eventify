import express from "express";
import wrapAsync from "../utils/wrapAsync.js";
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController.js";

import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

router.get('/', wrapAsync(getEvents));
router.get('/:id', wrapAsync(getEventById));
router.post('/', protect, admin, wrapAsync(createEvent));
router.put('/:id', protect, admin, wrapAsync(updateEvent));
router.delete('/:id', protect, admin, wrapAsync(deleteEvent));

export default router;