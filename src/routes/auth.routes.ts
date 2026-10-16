import { Router } from "express";
import {
  getMe,
  login,
  logout,
  register,
} from "../controllers/auth.controller.js";
import authenticateToken from "../middleware/auth.middleware.js";
import { loginValidation, registerValidation } from "../validators/auth.js";
import validate from "../middleware/validate.middleware.js";

const authRouter = Router();

authRouter.route("/register").post(registerValidation, validate, register);
authRouter.route("/login").post(loginValidation, validate, login);
authRouter.route("/logout").post(authenticateToken, logout);
authRouter.route("/me").get(authenticateToken, getMe);

export default authRouter;
