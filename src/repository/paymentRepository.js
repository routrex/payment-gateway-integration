import { prisma } from "../config/db.js";

export const findPaymentByOrderId = async (order_id) => {
  const paymentById = await prisma.payments.findUnique({
    where: {
      order_id,
    },
  });

  return paymentById;
};

export const createPayment = async ({
  order_id,
  amount,
  snap_token,
  redirect_url,
}) => {
  const payment = await prisma.payments.create({
    data: {
      order_id,
      amount,
      snap_token,
      redirect_url,
    },
  });

  return payment;
};

export const updatePayment = async (tx, id, paymentData) => {
  const result = await tx.payments.update({
    where: {
      id,
    },
    data: paymentData,
  });

  return result;
};
