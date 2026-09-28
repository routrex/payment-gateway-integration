import {
  handleMidtransWebhookService,
  paymentService,
} from "../service/paymentService.js";

export const paymentsController = async (req, res) => {
  const order_id = req.body.order_id;
  const id_user = req.user.id_user;
  try {
    const result = await paymentService(order_id, id_user);

    res.status(201).json({
      success: true,
      message: "Payment transaction created !",
      data: result,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const handleMidtransWebhookController = async (req, res) => {
  const notificationPayload = req.body;
  try {
    await handleMidtransWebhookService(notificationPayload);
    res.status(200).json({
      success: true,
      message: "Webhook processed successfully!",
    });
  } catch (err) {
    console.log(`Erro webhook : ${err}`)
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
