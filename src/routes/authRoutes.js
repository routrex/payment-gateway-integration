import express from "express";
import {
  getProfile,
  googleOAuth,
  googleOAuthCallback,
} from "../controller/authController.js";
import verifyToken from "../middleware/verifyToken.js";

const route = express.Router();

route.get("/profile", verifyToken, getProfile)
route.get("/google", googleOAuth);
route.get("/google/callback", googleOAuthCallback);
// route.post("/logout", logout);

export default route;
