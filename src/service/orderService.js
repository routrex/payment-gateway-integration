import { prisma } from "../config/db.js";
import generateOrderNumber from "../helpers/generateOrderNumber.js";
import {
  createOrder,
  createOrderDetails,
} from "../repository/orderRepository.js";
import { findProductByIds } from "../repository/productsRepository.js";

export const createOrderService = async ({ user_id, items }) => {
  // Get all product by id and save ids product in the array
  const productIds = items.map((item) => item.product_id);

  // Check for duplicate id using a set
  const set = new Set(productIds);
  if (set.size !== items.length) {
    throw new Error("Duplicate product IDs are not allowed in items!");
  }

  // Search for product in the database by id
  const existingProduct = await findProductByIds(productIds);

  // Check whether quantity of product matches the requested amount
  if (existingProduct.length !== items.length) {
    throw new Error("Product Not Found or Incomplete!");
  }

  // Calculate the total overall price
  let total_amount = 0;

  // Prepare the order detail data
  const orderDetails = items.map((itm) => {
    // Search for product and compare
    const product = existingProduct.find((e) => e.id === itm.product_id);

    // Multiply price for product in quantity itm
    const subtotal = product.price * itm.quantity;

    // The sump up the total price
    // lalu jumlahkan total harga
    total_amount += subtotal;

    // return result
    return {
      product_id: product.id,
      quantity: itm.quantity,
      price: product.price,
      subtotal,
    };
  });

  // generate order number
  const order_number = generateOrderNumber();

  // Run for Transaction
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Run function for create order
      const newOrder = await createOrder(tx, {
        user_id,
        order_number,
        total_amount,
      });

      // Save order id in every order details
      const orderDetail = orderDetails.map((detail) => ({
        ...detail,
        order_id: newOrder.id,
      }));

      // Save many data order details at a time
      await createOrderDetails(tx, orderDetail);

      // Return data order and items
      return {
        data: newOrder,
        item: orderDetail,
      };
    });

    // Return result process for transaksi
    return result;
  } catch (err) {
    throw err;
  }
};
