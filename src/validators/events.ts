import { query } from "express-validator";

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
