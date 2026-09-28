import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import {
  handleMidtransWebhookController,
  paymentsController,
} from "../controller/paymentController.js";

const route = express.Router();

route.post("/payments", verifyToken, paymentsController);
route.post("/payments/webhook", handleMidtransWebhookController);

export default route;
