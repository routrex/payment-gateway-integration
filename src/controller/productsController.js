import {
  createProductService,
  deleteProductService,
  getDetailProductService,
  getProductService,
  updateProductService,
} from "../service/productsService.js";

export const getDetailProductsController = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const result = await getDetailProductService(id);

    res.status(200).json({
      success: true,
      message: `Success Get Detail Products id ${id}`,
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getAllProductsController = async (req, res) => {
  try {
    const result = await getProductService();

    res.status(200).json({
      success: true,
      message: "Success Get All Products!",
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const createProducts = async (req, res) => {
  const { product_name, description, price } = req.dataValidate;
  const user_id = req.user.id_user;
  try {
    const result = await createProductService({
      product_name,
      description,
      price,
      user_id,
    });

    res.status(201).json({
      success: true,
      message: "Success Create product!",
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const updateProducts = async (req, res) => {
  const { product_name, description, price } = req.dataValidate;

  const id = parseInt(req.params.id);
  try {
    const result = await updateProductService({
      id,
      product_name,
      description,
      price,
    });

    res.status(200).json({
      success: true,
      message: `Success Update product ${id}!`,
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const deleteProducts = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await deleteProductService(id);

    res.status(200).json({
      success: true,
      message: `Success Delete product ${id}!`,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
