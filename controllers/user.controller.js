import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger.js';
import Subscription from '../models/subscription.model.js';
import mongoose from 'mongoose';

/**
 * @desc    Get all users (admin only)
 * @route   GET /api/v1/users
 * @access  Private/Admin
 */
export const getUsers = async (req, res, next) => {
  try {
    // Support for pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Filter by active status if specified
    const filterOptions = {};
    if (req.query.isActive !== undefined) {
      filterOptions.isActive = req.query.isActive === 'true';
    }
    
    // Count total documents for pagination
    const total = await User.countDocuments(filterOptions);
    
    // Get users with subscription count
    const users = await User.aggregate([
      { $match: filterOptions },
      { 
        $lookup: {
          from: 'subscriptions',
          localField: '_id',
          foreignField: 'user',
          as: 'subscriptions'
        }
      },
      {
        $addFields: {
          subscriptionsCount: { $size: '$subscriptions' },
          activeSubscriptionsCount: {
            $size: {
              $filter: {
                input: '$subscriptions',
                as: 'subscription',
                cond: { $eq: ['$$subscription.status', 'active'] }
              }
            }
          }
        }
      },
      {
        $project: {
          password: 0,
          resetPasswordToken: 0,
          resetPasswordExpire: 0,
          subscriptions: 0
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: startIndex },
      { $limit: limit }
    ]);

    res.status(200).json({ 
      success: true,
      count: users.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: users 
    });
  } catch (error) {
    logger.error(`Error fetching users: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get current user's profile
 * @route   GET /api/v1/users/profile
 * @access  Private
 */
export const getUserProfile = async (req, res, next) => {
  try {
    // Find user and populate subscription count
    const user = await User.findById(req.user.id);

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Get subscription statistics
    const subscriptionStats = await Subscription.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$price' }
        }
      }
    ]);

    // Format subscription stats
    const stats = {
      active: 0,
      cancelled: 0,
      expired: 0,
      totalSpend: 0
    };

    subscriptionStats.forEach(stat => {
      stats[stat._id] = stat.count;
      stats.totalSpend += stat.totalAmount;
    });

    res.status(200).json({ 
      success: true, 
      data: {
        user,
        subscriptionStats: stats
      }
    });
  } catch (error) {
    logger.error(`Error fetching user profile: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/v1/users/:id
 * @access  Private
 */
export const getUser = async (req, res, next) => {
  try {
    // Check if the user is trying to access their own profile or is an admin
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      const error = new Error('Not authorized to access this user profile');
      error.statusCode = 403;
      throw error;
    }

    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ 
      success: true, 
      data: user 
    });
  } catch (error) {
    logger.error(`Error fetching user: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Update user
 * @route   PUT /api/v1/users/:id
 * @access  Private
 */
export const updateUser = async (req, res, next) => {
  try {
    // Check if the user is trying to update their own profile or is an admin
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      const error = new Error('Not authorized to update this user');
      error.statusCode = 403;
      throw error;
    }

    // Extract updateable fields
    const { name, email } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;

    // Only admin can update role or active status
    if (req.user.role === 'admin') {
      if (req.body.role) updateData.role = req.body.role;
      if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive;
    }

    // If email is being updated, check if it already exists
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (existingUser) {
        const error = new Error('Email already in use');
        error.statusCode = 400;
        throw error;
      }
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    logger.info(`User updated: ${user._id}`);

    res.status(200).json({ 
      success: true, 
      data: user 
    });
  } catch (error) {
    logger.error(`Error updating user: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/v1/users/:id
 * @access  Private/Admin
 */
export const deleteUser = async (req, res, next) => {
  try {
    // Start a session to handle transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Find and delete the user
      const user = await User.findById(req.params.id);
      
      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }

      // Delete all user's subscriptions
      await Subscription.deleteMany({ user: req.params.id }, { session });
      
      // Delete the user
      await User.findByIdAndDelete(req.params.id, { session });
      
      // Commit the transaction
      await session.commitTransaction();
      session.endSession();
      
      logger.info(`User deleted: ${req.params.id}`);

      res.status(200).json({ 
        success: true, 
        data: {} 
      });
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    logger.error(`Error deleting user: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/v1/users/password
 * @access  Private
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Find user with password
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if current password is correct
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      const error = new Error('Current password is incorrect');
      error.statusCode = 401;
      throw error;
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    logger.info(`Password changed for user: ${user._id}`);

    res.status(200).json({ 
      success: true, 
      message: 'Password updated successfully' 
    });
  } catch (error) {
    logger.error(`Error changing password: ${error.message}`);
    next(error);
  }
};