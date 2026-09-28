import { prisma } from "../config/db.js";
import { paymentConfig, snap } from "../config/paymentConfig.js";
import {
  findOrderByOrderNumber,
  findOrdersById,
  updateOrder,
} from "../repository/orderRepository.js";
import {
  createPayment,
  findPaymentByOrderId,
  updatePayment,
} from "../repository/paymentRepository.js";

export const paymentService = async (order_id, id_user) => {
  const existingOrder = await findOrdersById(order_id);

  if (!existingOrder) {
    throw new Error("Order Not Found!");
  }

  if (existingOrder.user_id !== id_user) {
    throw new Error("You do not have permission to access this order!");
  }

  if (existingOrder.status_order !== "PENDING") {
    throw new Error("Only orders with a PENDING status can be paid for!");
  }

  const existingPaymentOrderById = await findPaymentByOrderId(order_id);

  if (existingPaymentOrderById) {
    if (existingPaymentOrderById.status_payment === "PENDING") {
      const resultPayment = {
        tokens: existingPaymentOrderById.snap_token,
        url: existingPaymentOrderById.redirect_url,
      };

      return resultPayment;
    }

    if (existingPaymentOrderById.status_payment === "PAID") {
      throw new Error("Lorem!");
    }
  }

  const orderNumber = existingOrder.order_number;
  const amount = existingOrder.total_amount;

  const snapToken = await paymentConfig(orderNumber, amount);

  const snap_token = snapToken.tokens;
  const redirect_url = snapToken.url;

  await createPayment({ order_id, amount, snap_token, redirect_url });

  return {
    orderNumber,
    amount,
    snapToken,
  };
};

export const handleMidtransWebhookService = async (notificationPayload) => {
  const statusResponse =
    await snap.transaction.notification(notificationPayload);

  // console.log(statusResponse);

  const order_number = statusResponse.order_id;
  const transactionId = statusResponse.transaction_id;
  const paymentType = statusResponse.payment_type;
  const grossAmount = Number(statusResponse.gross_amount);
  const transactionStatus = statusResponse.transaction_status;
  const fraudStatus = statusResponse.fraud_status;
  const settlementTime = statusResponse.settlement_time;
  const expiryTime = statusResponse.expiry_time;
  const transactionTime = statusResponse.transaction_time;

  const existingOrder = await findOrderByOrderNumber(order_number);

  if (!existingOrder) {
    throw new Error("Order not found!");
  }

  const existingPayment = await findPaymentByOrderId(existingOrder.id);

  if (!existingPayment) {
    throw new Error("Payment not found!");
  }

  if (grossAmount !== existingPayment.amount) {
    throw new Error("Payment amount does not match!");
  }

  let paymentStatus;

  if (transactionStatus === "pending") {
    paymentStatus = "PENDING";
  }

  if (transactionStatus === "settlement") {
    paymentStatus = "PAID";
  }

  if (transactionStatus === "capture") {
    if (fraudStatus === "accept") {
      paymentStatus = "PAID";
    } else if (fraudStatus === "challenge") {
      paymentStatus = "PENDING";
    } else {
      paymentStatus = "FAILED";
    }
  }

  if (transactionStatus === "expire") {
    paymentStatus = "EXPIRED";
  }

  if (
    transactionStatus === "cancel" ||
    transactionStatus === "deny" ||
    transactionStatus === "failure"
  ) {
    paymentStatus = "FAILED";
  }

  if (
    existingPayment.status_payment === paymentStatus &&
    existingPayment.payment_reference === transactionId
  ) {
    return {
      message: "Notification already processed!",
      status_payment: existingPayment.status_payment,
    };
  }

  let orderStatus;

  switch (paymentStatus) {
    case "PAID":
      orderStatus = "PAID";
      break;
    case "EXPIRED":
      orderStatus = "EXPIRED";
    case "FAILED":
      orderStatus = "FAILED";
    default:
      orderStatus = "PENDING";
  }

  const result = await prisma.$transaction(async (tx) => {
    const paymentData = {
      payment_reference: transactionId,
      payment_method: paymentType,
      status_payment: paymentStatus,
    };

    if (paymentStatus === "PAID") {
      paymentData.paid_at = new Date(settlementTime || transactionTime);
    }

    if (paymentStatus === "EXPIRED") {
      paymentData.expired_at = new Date(expiryTime || transactionTime);
    }

    const updatePayments = await updatePayment(
      tx,
      existingPayment.id,
      paymentData,
    );

    const updateOrders = await updateOrder(tx, existingOrder.id, {
      status_order: orderStatus,
    });

    return {
      updatePayments,
      updateOrders,
    };
  });

  return result;
};
