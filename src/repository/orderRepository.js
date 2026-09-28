import { prisma } from "../config/db.js";

export const findOrdersById = async (order_id) => {
  const orderById = await prisma.orders.findUnique({
    where: {
      id: order_id,
    },
  });

  return orderById;
};

export const findOrderByOrderNumber = async (order_number) => {
  const orderNumber = await prisma.orders.findUnique({
    where: {
      order_number,
    },
  });

  return orderNumber;
};

export const createOrder = async (tx, order) => {
  return await tx.orders.create({
    data: order,
  });
};

export const createOrderDetails = async (tx, orderDetail) => {
  return await tx.order_Details.createMany({
    data: orderDetail,
  });
};

export const updateOrder = async (tx, id, { status_order }) => {
  const result = await tx.orders.update({
    where: {
      id,
    },
    data: {
      status_order,
    },
  });

  return result;
};
