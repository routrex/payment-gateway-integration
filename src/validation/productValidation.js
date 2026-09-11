import Joi from "joi";

export const productValidation = (data) => {
  const schema = Joi.object({
    product_name: Joi.string().trim().required().messages({
      "any.required": "product_name is required!",
      "string.base": "product_name must be a text!",
      "string.empty": "product_name cannot be empty!",
    }),

    description: Joi.string().trim().required().messages({
      "any.required": "description is required!",
      "string.base": "description must be a text!",
      "string.empty": "description cannot be empty!",
    }),

    price: Joi.number().positive().required().messages({
      "any.required": "price is required!",
      "number.base": "price must be a valid number!",
      "number.positive": "price cannot be empty!",
    }),
  });

  const result = schema.validate(data, { abortEarly: false });
  return result;
};

export const updateProductValidation = (data) => {
  const schema = Joi.object({
    product_name: Joi.string().trim().optional().messages({
      "string.base": "product_name must be a text!",
      "string.empty": "product_name cannot be empty!",
    }),

    description: Joi.string().trim().optional().messages({
      "string.base": "description must be a text!",
      "string.empty": "description cannot be empty!",
    }),

    price: Joi.number().positive().optional().messages({
      "number.base": "price must be a valid number!",
      "number.positive": "price cannot be empty!",
    }),
  });

  const result = schema.validate(data, { abortEarly: false });
  return result;
};
