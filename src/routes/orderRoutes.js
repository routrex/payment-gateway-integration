import express from "express";
import {
  getAllProductsController,
  getDetailProductsController,
} from "../controller/productsController.js";
import verifyToken from "../middleware/verifyToken.js";
import { ordersController } from "../controller/orderControllers.js";
import validationMiddleware from "../middleware/validationMiddleware.js";
import { orderValidation } from "../validation/orderValidation.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const route = express.Router();

route.get(
  "/product-all",
  verifyToken,
  roleMiddleware("CUSTOMER"),
  getAllProductsController,
);
route.get(
  "/product/:id",
  verifyToken,
  roleMiddleware("CUSTOMER"),
  getDetailProductsController,
);
route.post(
  "/orders",
  verifyToken,
  roleMiddleware("CUSTOMER"),
  validationMiddleware(orderValidation),
  ordersController,
);

export default route;
