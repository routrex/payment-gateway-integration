import {
  createProduct,
  deleteProduct,
  findProductById,
  findProductByName,
  getAllProduct,
  getDetailProductById,
  updateProduct,
} from "../repository/productsRepository.js";

export const getDetailProductService = async (id) => {
  const products = await getDetailProductById(id);
  return products;
};

export const getProductService = async () => {
  const products = await getAllProduct();
  return products;
};

export const createProductService = async ({
  product_name,
  description,
  price,
  user_id,
}) => {
  const existingProduct = await findProductByName(product_name);

  if (existingProduct) {
    throw new Error("Products already exists!");
  }

  const result = await createProduct({
    product_name,
    description,
    price,
    user_id,
  });
  return result;
};

export const updateProductService = async ({
  id,
  product_name,
  description,
  price,
}) => {
  const existingProductId = await findProductById(id);

  if (!existingProductId) {
    throw new Error("Product ID does not exist.");
  }

  if (product_name !== undefined && product_name !== null) {
    const existingProductName = await findProductByName(product_name);

    if (existingProductName && existingProductName.id != Number(id)) {
      throw new Error("Product name is already in use!");
    }
  }

  const result = await updateProduct({ product_name, description, price, id });
  return result;
};

export const deleteProductService = async (id) => {
  const existingProductId = await findProductById(id);

  if (!existingProductId) {
    throw new Error("Product ID does not exist.");
  }

  const result = await deleteProduct(id);
  return result;
};
