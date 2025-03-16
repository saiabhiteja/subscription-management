// middlewares/validation.middleware.js
import { validationResult } from 'express-validator';

/**
 * Validation middleware that checks for validation errors from express-validator
 * If errors are found, it returns a 400 Bad Request response with detailed error messages
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg
      }))
    });
  }
  
  next();
};

export default validateRequest;