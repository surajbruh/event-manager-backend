import { Router } from "express";
import type { Request, Response } from "express";
import authRouter from "./auth.routes.js";
import eventsRouter from "./events.routes.js";
import registerationRouter from "./registeration.routes.js";

const router = Router();

router.use("/api/auth", authRouter);
router.use("/api/events", eventsRouter);
router.use("/api/events/:id/register", registerationRouter);

router.get("/health", (request: Request, response: Response) => {
  response.status(200).json({ status: "UP", uptime: process.uptime() });
});

export default router;
