import { Router } from "express";
import authenticateToken from "../middleware/auth.middleware";
import {
  createEvent,
  fetchAllEvents,
  fetchEventById,
} from "../controllers/events.controller";

const eventsRouter = Router();

eventsRouter
  .route("/")
  .get(fetchAllEvents) //get all events
  .post(authenticateToken, createEvent); // create new event (protected route)

eventsRouter.route("/:eventId").get(fetchEventById);

export default eventsRouter;
