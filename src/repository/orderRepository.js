import { prisma } from "../config/db.js";

export const createOrderDetails = async (tx, orderDetail) => {
  return await tx.Order_Details.createMany({
    data: orderDetail,
  });
};

export const createOrder = async (tx, order) => {
  return await tx.Orders.create({
    data: order,
  });
};
