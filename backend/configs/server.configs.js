import dotenv from "dotenv";

//passing env configs into process obj
dotenv.config();

const serverConfigs = {
  PORT: process.env.PORT,
  DB_URL: process.env.DB_URL,
  JWT_SECRET: process.env.JWT_SECRET,
};

export default serverConfigs;
