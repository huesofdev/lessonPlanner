import mongoose from "mongoose";
import serverConfigs from "../configs/server.configs.js";

const { DB_URL } = serverConfigs;

export const dbConnection = async () => {
  await mongoose.connect(DB_URL);
  console.log("db connected successfully");
};

export const dbDisconnection = async () => {
  await mongoose.disconnect(DB_URL);
  console.log("db disconnected successfully");
};
