import { Router } from "express";
import authenticateToken from "../middleware/auth.middleware";
import {
  createEvent,
  deleteEvent,
  fetchAllEvents,
  fetchEventById,
  registerUserForEvent,
} from "../controllers/events.controller";

const eventsRouter = Router();

eventsRouter
  .route("/")
  .get(fetchAllEvents) //get all events
  .post(authenticateToken, createEvent); // create new event (protected route)

eventsRouter
  .route("/:eventId")
  .get(fetchEventById) // fetch event by id
  .delete(authenticateToken, deleteEvent); // delete event

eventsRouter
  .route("/:eventId/register")
  .patch(authenticateToken, registerUserForEvent); // register user for an event

export default eventsRouter;
