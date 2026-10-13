import { body, query } from "express-validator";
import path from "path";
import { eventCategory } from "../models/event.model";

export const listQueryValidation = [
  query("q")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Search query must be a string with max 100 characters"),

  query("category")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Category must be a non-empty string"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer")
    .toInt(),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100")
    .toInt(),
];

export const createEventValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10, max: 2000 })
    .withMessage("Description must be between 10 and 2000 characters"),

  body("location")
    .trim()
    .notEmpty()
    .withMessage("Location is required")
    .isLength({ min: 3, max: 200 })
    .withMessage("Location must be between 3 and 200 characters"),

  body("startDate")
    .notEmpty()
    .withMessage("Start date is required")
    .isISO8601()
    .withMessage("Start date must be a valid date"),

  body("endDate")
    .notEmpty()
    .withMessage("End date is required")
    .isISO8601()
    .withMessage("End date must be a valid date")
    .custom((endDate, { req }) => {
      if (new Date(endDate) <= new Date(req.body.startDate))
        throw new Error("End date must be after start date");
      return true;
    }),

  body("capacity")
    .notEmpty()
    .withMessage("Capacity is required")
    .isInt({ min: 1 })
    .withMessage("Capacity must be a positive integer")
    .toInt(),

  body("image").custom((value, { req }) => {
    // 1. Check if a file was actually uploaded
    if (!req.file) throw new Error("Please upload an image file.");

    // 2. Validate File Extension
    const allowedExtensions = [".png", ".jpg", ".jpeg"];
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      throw new Error(
        "Invalid file type. Only JPG, JPEG, and PNG are allowed.",
      );
    }

    // 3. Validate Mime Type (more secure than extension alone)
    const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedMimeTypes.includes(req.file.mimetype))
      throw new Error("Invalid mime type.");

    // 4. Validate File Size (e.g., maximum 5MB)
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB
    if (req.file.size > maxSizeBytes)
      throw new Error("File size is too large. Maximum limit is 2MB.");

    return true;
  }),
];

export const updateEventValidation = [
  body("title")
    .trim()
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),

  body("description")
    .trim()
    .optional()
    .isLength({ min: 10, max: 2000 })
    .withMessage("Description must be between 10 and 2000 characters"),

  body("location")
    .trim()
    .optional()
    .isLength({ min: 3, max: 200 })
    .withMessage("Location must be between 3 and 200 characters"),

  body("category")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Category must be a non-empty string")
    .isIn(eventCategory)
    .withMessage("Category is not valid"),

  body("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid date"),

  body("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid date")
    .custom((endDate, { req }) => {
      if (new Date(endDate) <= new Date(req.body.startDate))
        throw new Error("End date must be after start date");
      return true;
    }),

  body("capacity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Capacity must be a positive integer")
    .toInt(),

  body("image")
    .optional()
    .custom((value, { req }) => {
      // 1. Check if a file was actually uploaded
      if (!req.file) throw new Error("Please upload an image file.");

      // 2. Validate File Extension
      const allowedExtensions = [".png", ".jpg", ".jpeg"];
      const fileExtension = path.extname(req.file.originalname).toLowerCase();
      if (!allowedExtensions.includes(fileExtension)) {
        throw new Error(
          "Invalid file type. Only JPG, JPEG, and PNG are allowed.",
        );
      }

      // 3. Validate Mime Type (more secure than extension alone)
      const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowedMimeTypes.includes(req.file.mimetype))
        throw new Error("Invalid mime type.");

      // 4. Validate File Size (e.g., maximum 5MB)
      const maxSizeBytes = 5 * 1024 * 1024; // 5MB
      if (req.file.size > maxSizeBytes)
        throw new Error("File size is too large. Maximum limit is 2MB.");

      return true;
    }),
];
