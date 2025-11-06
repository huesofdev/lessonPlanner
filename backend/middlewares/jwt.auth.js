import jwt from "jsonwebtoken";
import { verifyJwt } from "../utils/jwt.util.js";

const authMiddleware = (req, res, next) => {
  try {
    if (
      !req.headers["authorization"] ||
      !req.headers["authorization"].startsWith("Bearer")
    ) {
      throw new Error("please signin!");
    }
    console.log("coming here");
    const token = req.headers["authorization"].split(" ")[1];
    const decoded = verifyJwt(token);

    
    //validating the isActive

    if(!decoded.isActive){
      
      throw new Error("you account is not activated yet! to do this Action")
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      msg: "",
      error: error.message,
    });
  }
};

export default authMiddleware;
