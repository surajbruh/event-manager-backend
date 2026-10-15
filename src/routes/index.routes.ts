import { Router } from "express";
import type { Request, Response } from "express";
import authRouter from "./auth.routes.js";
import eventsRouter from "./events.routes.js";
import authenticateToken from "../middleware/auth.middleware.js";
import { Registration } from "../models/registration.model.js";

const router = Router();

router.use("/api/auth", authRouter);
router.use("/api/events", eventsRouter);

router.get("/health", (request: Request, response: Response) => {
  response.status(200).json({ status: "UP", uptime: process.uptime() });
});

router.get(
  "/api/users/me/events",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const tickets = await Registration.find({ user: user.id }).populate([
        "event",
      ]);

      return res.status(200).json({
        success: true,
        message: "Tickets fetched successfully",
        tickets,
      });
    } catch (error) {
      console.error("FETCH__EVENT_CONTROLLER_ERROR:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },
);

export default router;
