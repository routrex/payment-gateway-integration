import jwt from "jsonwebtoken";
import { createUser, findByEmail, findById } from "../repository/userRepository.js";

export const getProfileService = async (id) => {
  try {
    const findUserId = await findById(id);

    if (!findUserId) {
      throw new Error("User id does not exist!");
    }

    return findUserId;
  } catch (err) {
    throw err;
  }
};

export const googleOAuthService = async (data) => {
  const existingUser = await findByEmail(data.email);

  if (existingUser) {
    const tokenPayload = {
      id_user: existingUser.id,
    };

    const token = await jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return {
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
      image: existingUser.image,
      role: existingUser.role,
      token: token,
    };
  }

  let role = "CUSTOMER";

  if (data.email === process.env.ADMIN_EMAIL) {
    role = "ADMIN";
  }

  const name = data.name;
  const email = data.email;
  const image = data.picture;

  try {
    const user = await createUser({ name, email, image, role });

    const tokenPayload = {
      id_user: user.id,
    };

    const token = await jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      token: token,
    };
  } catch (err) {
    throw err;
  }
};
