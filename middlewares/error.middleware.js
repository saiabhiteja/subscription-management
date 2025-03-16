import logger from '../utils/logger.js';
import { NODE_ENV } from '../config/env.js';

/**
 * Custom error handler middleware
 * Handles different types of errors and formats responses consistently
 */
const errorMiddleware = (err, req, res, next) => {
  try {
    let error = { ...err };
    error.message = err.message;
    
    // Log error for server-side debugging
    logger.error(`${req.method} ${req.path} - ${err.statusCode || 500}: ${err.message}`);
    if (NODE_ENV === 'development') {
      logger.error(err.stack);
    }

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
      const message = `Resource not found. Invalid: ${err.path}`;
      error = new Error(message);
      error.statusCode = 404;
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      const message = `Duplicate field value: ${field}. Please use another value.`;
      error = new Error(message);
      error.statusCode = 400;
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
      const message = Object.values(err.errors).map(val => val.message);
      error = new Error(message.join(', '));
      error.statusCode = 400;
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
      error = new Error('Invalid token. Please log in again.');
      error.statusCode = 401;
    }

    if (err.name === 'TokenExpiredError') {
      error = new Error('Your token has expired. Please log in again.');
      error.statusCode = 401;
    }

    // Create error response
    const errorResponse = {
      success: false,
      error: {
        message: error.message || 'Server Error',
        code: error.statusCode || 500
      }
    };

    // Add error details in development environment
    if (NODE_ENV === 'development') {
      errorResponse.error.stack = err.stack;
      if (err.errors) {
        errorResponse.error.validationErrors = err.errors;
      }
    }

    res.status(error.statusCode || 500).json(errorResponse);
  } catch (internalError) {
    // If error handling itself fails, log and return a generic error
    logger.error(`Error handler failed: ${internalError.message}`);
    res.status(500).json({ 
      success: false, 
      error: { 
        message: 'An unexpected error occurred', 
        code: 500 
      }
    });
    next(internalError);
  }
};

export default errorMiddleware;