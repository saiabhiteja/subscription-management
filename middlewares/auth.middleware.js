import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';
import User from '../models/user.model.js';
import logger from '../utils/logger.js';

/**
 * Middleware to protect routes - requires valid JWT token
 */
export const authorize = async (req, res, next) => {
  try {
    let token;

    // Get token from Authorization header (Bearer token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } 
    // Check for token in cookies as fallback
    else if (req.cookies.token) {
      token = req.cookies.token;
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized to access this route' 
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Find user by id from decoded token
      const user = await User.findById(decoded.userId);
      
      // Check if user exists
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'User not found with this id' 
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Your account has been deactivated'
        });
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (err) {
      logger.error(`JWT verification failed: ${err.message}`);
      return res.status(401).json({ 
        success: false, 
        message: 'Token is not valid' 
      });
    }
  } catch (error) {
    logger.error(`Authorization error: ${error.message}`);
    res.status(500).json({ 
      success: false,
      message: 'Server error during authorization',
      error: error.message 
    });
  }
};

/**
 * Middleware to restrict access to specific roles
 * @param {...String} roles - Roles that are allowed to access the route
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(500).json({
        success: false,
        message: 'Authorization middleware must be used before role restriction'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action'
      });
    }

    next();
  };
};

export default authorize;