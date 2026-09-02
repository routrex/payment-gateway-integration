import express from "express";
import {
  googleOAuth,
  googleOAuthCallback,
} from "../controller/authController.js";

const route = express.Router();

// route.get("/profile", verifyToken, getProfile)
route.get("/google", googleOAuth);
route.get("/google/callback", googleOAuthCallback);
// route.post("/logout", logout);

export default route;
