import { createOrderService } from "../service/orderService.js";

export const ordersController = async (req, res) => {
  const { items } = req.dataValidate;
  const user_id = req.user.id_user;

  try {
    const result = await createOrderService({ user_id, items });
    res.status(201).json({
      success: true,
      message: "Success Create order!",
      data: result,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
