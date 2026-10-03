import "dotenv/config";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { AuthPayload } from "../types/express";

const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies?.userToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");

    const decodedToken = jwt.verify(token, secret) as AuthPayload;

    req.user = decodedToken;

    next();
  } catch (error) {
    console.error("AUTHENTICATE_TOKEN MIDDLEWARE ERROR", error);
    return res.status(500).json("Something went wrong");
  }
};

export default authenticateToken;
