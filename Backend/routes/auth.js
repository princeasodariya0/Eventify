import express from "express";
import wrapAsync from "../utils/wrapAsync.js";
import { register, login, verifyOTP } from "../controllers/authController.js";

const router = express.Router();

router.post('/register', wrapAsync(register));
router.post('/login', wrapAsync(login));
router.post('/verify-otp', wrapAsync(verifyOTP));

export default router;
