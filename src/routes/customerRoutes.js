import express from "express";
import {
  getAllProductsController,
  getDetailProductsController,
} from "../controller/productsController.js";
import verifyToken from "../middleware/verifyToken.js";

const route = express.Router();

route.get("/products", verifyToken, getAllProductsController);
route.get("/products/:id", verifyToken, getDetailProductsController);

export default route;
