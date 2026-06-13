import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ExpressError from "../utils/ExpressError.js";

const protect = async (req, res, next) => {
  let token = req.headers.authorization;

  if (!token || !token.startsWith("Bearer ")) {
    return next(new ExpressError(401, "Not authorized, no token"));
  }

  try {
    token = token.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return next(
        new ExpressError(401, "Not authorized, user not found")
      );
    }

    next();
  } catch (error) {
    next(new ExpressError(401, "Invalid or expired token"));
  }
};

const admin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return next(
      new ExpressError(403, "Not authorized as an admin")
    );
  }

  next();
};

export { protect, admin };