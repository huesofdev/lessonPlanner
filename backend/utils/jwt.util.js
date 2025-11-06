import jwt from "jsonwebtoken";
import serverConfigs from "../configs/server.configs.js";

const { JWT_SECRET } = serverConfigs;

export const genarateJwt = (payload) => {
  if (!payload) {
    throw new Error("you need a valid payload");
  }

  return jwt.sign(payload, JWT_SECRET, { expiresIn: "3d" });
};

export const verifyJwt = (token) => {
  if (!token) {
    throw new Error("you need a valid token");
  }
  return jwt.verify(token, JWT_SECRET);
};
