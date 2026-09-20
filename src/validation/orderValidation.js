import Joi from "joi";

export const orderValidation = (data) => {
  const schema = Joi.object({
    items: Joi.array()
      .items(
        Joi.object({
          product_id: Joi.number().integer().min(1).required().messages({
            "any.required": "product_id is required!",
            "number.base": "product_id must be a valid number!",
            "number.min": "quantity must be at least 1!",
          }),
          quantity: Joi.number().integer().min(1).required().messages({
            "any.required": "quantity is required!",
            "number.base": "quantity must be a valid number!",
            "number.min": "quantity must be at least 1!",
          }),
        }),
      )
      .min(1)
      .required()
      .messages({
        "any.required": "Items is required!",
        "array.min": "Items must contain at least 1 product!",
      }),
  });

  const result = schema.validate(data, { abortEarly: false });
  return result;
};
