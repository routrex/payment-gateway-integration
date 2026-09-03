import { prisma } from "../config/db.js";

export const findById = async (id) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  return user;
};


export const findByEmail = async (email) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  return user;
};

export const createUser = async ({ name, email, image, role }) => {
  const user = await prisma.user.create({
    data: {
      name,
      email,
      image,
      role,
    },
  });

  return user;
};
