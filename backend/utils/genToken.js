import jwt from "jsonwebtoken";

export const genToken = async (id , role, college) => {
  return jwt.sign({ id , role, college}, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};
