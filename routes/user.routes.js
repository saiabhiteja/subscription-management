import { Router } from "express";
import { 
  getUsers, 
  getUser, 
  updateUser, 
  deleteUser,
  changePassword,
  getUserProfile
} from "../controllers/user.controller.js";
import { authorize, restrictTo } from "../middlewares/auth.middleware.js";
import { param } from 'express-validator';
import validateRequest from "../middlewares/validation.middleware.js";
import { updateUserValidator, changePasswordValidator } from "../validators/user.validator.js";

const userRouter = Router();

/**
 * @route   GET /api/v1/users
 * @desc    Get all users
 * @access  Private/Admin
 */
userRouter.get('/', authorize, restrictTo('admin'), getUsers);

/**
 * @route   GET /api/v1/users/profile
 * @desc    Get current user's profile
 * @access  Private
 */
userRouter.get('/profile', authorize, getUserProfile);

/**
 * @route   PUT /api/v1/users/password
 * @desc    Change password
 * @access  Private
 */
userRouter.put('/password', 
  [
    authorize,
    changePasswordValidator
  ],
  validateRequest,
  changePassword
);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
userRouter.get('/:id', 
  [
    authorize, 
    param('id').isMongoId().withMessage('Invalid user ID')
  ],
  validateRequest,
  getUser
);

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update user
 * @access  Private
 */
userRouter.put('/:id', 
  [
    authorize, 
    param('id').isMongoId().withMessage('Invalid user ID'),
    updateUserValidator
  ],
  validateRequest,
  updateUser
);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete user
 * @access  Private/Admin
 */
userRouter.delete('/:id', 
  [
    authorize, 
    restrictTo('admin'),
    param('id').isMongoId().withMessage('Invalid user ID')
  ],
  validateRequest,
  deleteUser
);

export default userRouter;