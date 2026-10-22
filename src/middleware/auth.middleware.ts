import "dotenv/config";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { AuthPayload } from "../types/express";
import { AppError } from "./error.middleware";

const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies?.userToken;
    if (!token) throw new AppError("Access token required", 401);

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new AppError("JWT_SECRET is not defined", 500);

    const decodedToken = jwt.verify(token, secret) as AuthPayload;

    req.user = decodedToken;
    next();
  } catch (error: unknown) {
    if (error instanceof jwt.JsonWebTokenError)
      return next(new AppError("Invalid or expired access token", 401));

    return next(error);
  }
};

export default authenticateToken;
