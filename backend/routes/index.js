import express from "express";
import userRouter from "./user.routes.js";
import hodRouter from "./hod.routes.js";
import adminRouter from "./admin.routes.js";

export const v1Router = express.Router();
v1Router.use("/user", userRouter);
v1Router.use("/hod", hodRouter);
v1Router.use("/admin", adminRouter);

export const v2Router = express.Router();
v2Router.all("/", (req, res) => {
  res.send("sorry this route is restricted");
});
