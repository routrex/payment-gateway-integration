import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import {
  createProducts,
  deleteProducts,
  getAllProductsController,
  updateProducts,
} from "../controller/productsController.js";
import validationMiddleware from "../middleware/validationMiddleware.js";
import {
  productValidation,
  updateProductValidation,
} from "../validation/productValidation.js";

const route = express.Router();

route.get(
  "/products-all",
  verifyToken,
  roleMiddleware,
  getAllProductsController,
);

route.post(
  "/products",
  verifyToken,
  roleMiddleware,
  validationMiddleware(productValidation),
  createProducts,
);

route.patch(
  "/products/:id",
  verifyToken,
  roleMiddleware,
  validationMiddleware(updateProductValidation),
  updateProducts,
);

route.delete("/products/:id", verifyToken, roleMiddleware, deleteProducts);

export default route;
