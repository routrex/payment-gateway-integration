import { prisma } from "../config/db.js";

export const getDetailProductById = async (id) => {
  const productAll = await prisma.products.findUnique({
    where: {
      id,
    },
  });
  return productAll;
};

export const getAllProduct = async () => {
  const productAll = await prisma.products.findMany({
    select: {
      id: true,
      product_name: true,
      description: true,
      price: true,
    },
  });
  return productAll;
};

export const findProductById = async (id) => {
  const product = await prisma.products.findFirst({
    where: {
      id,
    },
  });

  return product;
};

export const findProductByName = async (product_name) => {
  const product = await prisma.products.findFirst({
    where: {
      product_name,
    },
  });

  return product;
};

export const createProduct = async ({
  product_name,
  description,
  price,
  user_id,
}) => {
  const product = await prisma.products.create({
    data: {
      product_name,
      description,
      price,
      user_id,
    },
  });

  return product;
};

export const updateProduct = async ({
  product_name,
  description,
  price,
  id,
}) => {
  const product = await prisma.products.updateMany({
    where: {
      id,
    },

    data: {
      product_name,
      description,
      price,
    },
  });

  return product;
};

export const deleteProduct = async (id) => {
  const product = await prisma.products.delete({
    where: {
      id,
    },
  });

  return product;
};
