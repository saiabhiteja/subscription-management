import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/env.js';
import logger from '../utils/logger.js';

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/sign-up
 * @access  Public
 */
export const signUp = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name, email, password } = req.body;

    // Check if a user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const error = new Error('User already exists');
      error.statusCode = 409;
      throw error;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUsers = await User.create(
      [{ 
        name, 
        email, 
        password: hashedPassword,
        role: 'user' // Default role
      }], 
      { session }
    );

    const token = jwt.sign(
      { 
        userId: newUsers[0]._id,
        role: newUsers[0].role
      }, 
      JWT_SECRET, 
      { expiresIn: JWT_EXPIRES_IN }
    );

    await session.commitTransaction();
    session.endSession();

    logger.info(`New user registered: ${email}`);

    // Remove password from response
    const user = newUsers[0].toObject();
    delete user.password;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        token,
        user
      }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    logger.error(`Registration error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Login user & get token
 * @route   POST /api/v1/auth/sign-in
 * @access  Public
 */
export const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    // Check if password matches
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    // Create and sign JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        role: user.role
      }, 
      JWT_SECRET, 
      { expiresIn: JWT_EXPIRES_IN }
    );

    logger.info(`User signed in: ${email}`);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: 'User signed in successfully',
      data: {
        token,
        user: userResponse
      }
    });
  } catch (error) {
    logger.error(`Sign in error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Sign out user (frontend token removal)
 * @route   POST /api/v1/auth/sign-out
 * @access  Public
 */
export const signOut = async (req, res, next) => {
  try {
    // Since JWT tokens are stateless, we cannot invalidate them server-side
    // The client should remove the token from storage
    // We can only confirm the action
    
    logger.info('User signed out');
    
    res.status(200).json({
      success: true,
      message: 'User signed out successfully'
    });
  } catch (error) {
    logger.error(`Sign out error: ${error.message}`);
    next(error);
  }
}