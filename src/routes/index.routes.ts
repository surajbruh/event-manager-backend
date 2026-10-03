import { Router } from "express";
import type { Request, Response } from "express";
import authRouter from "./auth.routes.js";
import eventsRouter from "./events.routes.js";

const router = Router();

router.use("/api/auth", authRouter);
router.use("/api/events", eventsRouter);

router.route("/").get(async (request: Request, response: Response) => {
  try {
    response.status(200).json("Hello world!");
  } catch (error) {
    throw error;
  }
});

router.get("/health", (request: Request, response: Response) => {
  response.status(200).json({ status: "UP", uptime: process.uptime() });
});

export default router;
