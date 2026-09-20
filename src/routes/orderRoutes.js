import express from "express";
import {
  getAllProductsController,
  getDetailProductsController,
} from "../controller/productsController.js";
import verifyToken from "../middleware/verifyToken.js";
import { ordersController } from "../controller/orderControllers.js";
import validationMiddleware from "../middleware/validationMiddleware.js";
import { orderValidation } from "../validation/orderValidation.js";

const route = express.Router();

route.get("/products", verifyToken, getAllProductsController);
route.get("/products/:id", verifyToken, getDetailProductsController);
route.post("/orders", verifyToken, validationMiddleware(orderValidation), ordersController);

export default route;
