import { Router } from "express";
import {
  getMe,
  login,
  logout,
  register,
} from "../controllers/auth.controller.js";
import authenticateToken from "../middleware/auth.middleware.js";

const authRouter = Router();

authRouter.route("/register").post(register);
authRouter.route("/login").post(login);
authRouter.route("/logout").post(authenticateToken, logout);
authRouter.route("/me").get(authenticateToken, getMe);

export default authRouter;
