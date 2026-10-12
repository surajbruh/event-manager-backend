import { Router } from "express";
import authenticateToken from "../middleware/auth.middleware";
import {
  createEvent,
  deleteEvent,
  fetchAllEvents,
  fetchEventById,
  registerUserForEvent,
} from "../controllers/events.controller";
import {
  createEventValidation,
  listQueryValidation,
} from "../validators/events";
import validate from "../middleware/validate.middleware";
import { upload } from "../middleware/multer.middleware";

const eventsRouter = Router();

eventsRouter
  .route("/")
  .get(listQueryValidation, validate, fetchAllEvents) //get all events
  .post(
    authenticateToken,
    upload.single("image"),
    createEventValidation,
    validate,
    createEvent,
  ); // create new event (protected route)

eventsRouter
  .route("/:eventId")
  .get(fetchEventById) // fetch event by id
  .delete(authenticateToken, deleteEvent); // delete event

eventsRouter
  .route("/:eventId/register")
  .patch(authenticateToken, registerUserForEvent); // register user for an event

export default eventsRouter;
