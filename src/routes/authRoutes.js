import express from "express";
import {
  getProfile,
  googleOAuth,
  googleOAuthCallback,
  logout,
} from "../controller/authController.js";
import verifyToken from "../middleware/verifyToken.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const route = express.Router();

route.get("/profile/admin", verifyToken, roleMiddleware, getProfile);
route.get("/profile", verifyToken, getProfile);
route.get("/google", googleOAuth);
route.get("/google/callback", googleOAuthCallback);
route.post("/logout", verifyToken, logout);

export default route;
