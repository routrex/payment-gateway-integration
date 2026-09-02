import jwt from "jsonwebtoken";
import { createUser, findByEmail } from "../repository/userRepository.js";

const googleOAuthService = async (data) => {
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

  // try {
  //   const name = data.name;
  //   const email = data.email;
  //   const image = data.image;
  //   const user = await createUser({ name, email, image });

  //   const tokenPayload = {
  //     id_user: user.id,
  //   };

  //   const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
  //     expiresIn: "1h",
  //   });

  //   return {
  //     id: user.id,
  //     name: user.name,
  //     email: user.email,
  //     image: user.image,
  //     role: user.role,
  //     token: token,
  //   };
  // } catch (err) {
  //   throw err;
  // }
};

export default googleOAuthService;
