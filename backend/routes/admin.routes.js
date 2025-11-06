import { Router } from "express";
import { approveUser } from "../controllers/adminController.js";
import authMiddleware from "../middlewares/jwt.auth.js";

const adminRouter = Router();

//activate userAccounts

adminRouter.patch("/approve/:userId",authMiddleware, approveUser)










export default adminRouter