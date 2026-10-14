import { Router } from "express";
import authenticateToken from "../middleware/auth.middleware";
import {
  createEvent,
  deleteEvent,
  fetchAllEvents,
  fetchEventById,
  updateEvent,
} from "../controllers/events.controller";
import {
  createEventValidation,
  listQueryValidation,
  updateEventValidation,
} from "../validators/events";
import validate from "../middleware/validate.middleware";
import { upload } from "../middleware/multer.middleware";
import {
  cancelRegistration,
  registerUserForEvent,
} from "../controllers/registration.controller";

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
  .patch(
    authenticateToken,
    upload.single("image"),
    updateEventValidation,
    validate,
    updateEvent,
  )
  .delete(authenticateToken, deleteEvent); // delete event

eventsRouter
  .route("/:eventId/register")
  .post(authenticateToken, registerUserForEvent) // register user for an event
  .patch(authenticateToken, cancelRegistration);

export default eventsRouter;
