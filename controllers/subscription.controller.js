import Subscription from '../models/subscription.model.js'
import { workflowClient } from '../config/upstash.js'
import { SERVER_URL } from '../config/env.js'
import logger from '../utils/logger.js'

/**
 * @desc    Create a new subscription
 * @route   POST /api/v1/subscriptions
 * @access  Private
 */
export const createSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.create({
      ...req.body,
      user: req.user._id,
    });

    const { workflowRunId } = await workflowClient.trigger({
      url: `${SERVER_URL}/api/v1/workflows/subscriptions/reminder`,
      body: {
        subscriptionId: subscription.id,
      },
      headers: {
        'content-type': 'application/json',
      },
      retries: 2,
    })

    res.status(201).json({ success: true, data: { subscription, workflowRunId} });
  } catch (e) {
    next(e);
  }
}

/**
 * @desc    Get all subscriptions for a user
 * @route   GET /api/v1/subscriptions/user/:id
 * @access  Private
 */
export const getUserSubscriptions = async (req, res, next) => {
  try {
    // Check if the user is the same as the one in the token
    if(req.user.id !== req.params.id) {
      const error = new Error('You are not the owner of this account');
      error.status = 401;
      throw error;
    }

    const subscriptions = await Subscription.find({ user: req.params.id });

    res.status(200).json({ success: true, data: subscriptions });
  } catch (e) {
    next(e);
  }
}

/**
 * @desc    Get subscription by ID
 * @route   GET /api/v1/subscriptions/:id
 * @access  Private
 */
export const getSubscriptionById = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      const error = new Error('Subscription not found');
      error.statusCode = 404;
      throw error;
    }

    // Authorization check
    if (subscription.user.toString() !== req.user.id && req.user.role !== 'admin') {
      const error = new Error('Not authorized to access this subscription');
      error.statusCode = 403;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: subscription
    });
  } catch (error) {
    logger.error(`Error fetching subscription: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Update subscription
 * @route   PUT /api/v1/subscriptions/:id
 * @access  Private
 */
export const updateSubscription = async (req, res, next) => {
  try {
    let subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      const error = new Error('Subscription not found');
      error.statusCode = 404;
      throw error;
    }

    // Check ownership
    if (subscription.user.toString() !== req.user.id && req.user.role !== 'admin') {
      const error = new Error('Not authorized to update this subscription');
      error.statusCode = 403;
      throw error;
    }

    subscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    logger.info(`Subscription updated: ${subscription.id}`);

    res.status(200).json({
      success: true,
      data: subscription
    });
  } catch (error) {
    logger.error(`Error updating subscription: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Delete subscription
 * @route   DELETE /api/v1/subscriptions/:id
 * @access  Private
 */
export const deleteSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      const error = new Error('Subscription not found');
      error.statusCode = 404;
      throw error;
    }

    // Check ownership
    if (subscription.user.toString() !== req.user.id && req.user.role !== 'admin') {
      const error = new Error('Not authorized to delete this subscription');
      error.statusCode = 403;
      throw error;
    }

    await subscription.remove();

    logger.info(`Subscription deleted: ${req.params.id}`);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    logger.error(`Error deleting subscription: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Cancel subscription
 * @route   PUT /api/v1/subscriptions/:id/cancel
 * @access  Private
 */
export const cancelSubscription = async (req, res, next) => {
  try {
    let subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      const error = new Error('Subscription not found');
      error.statusCode = 404;
      throw error;
    }

    // Check ownership
    if (subscription.user.toString() !== req.user.id && req.user.role !== 'admin') {
      const error = new Error('Not authorized to cancel this subscription');
      error.statusCode = 403;
      throw error;
    }

    subscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );

    logger.info(`Subscription cancelled: ${subscription.id}`);

    res.status(200).json({
      success: true,
      data: subscription
    });
  } catch (error) {
    logger.error(`Error cancelling subscription: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get upcoming renewals
 * @route   GET /api/v1/subscriptions/upcoming-renewals
 * @access  Private
 */
export const getUpcomingRenewals = async (req, res, next) => {
  try {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const subscriptions = await Subscription.find({
      user: req.user.id,
      status: 'active',
      renewalDate: {
        $gte: new Date(),
        $lte: nextWeek
      }
    }).sort({ renewalDate: 1 });

    res.status(200).json({
      success: true,
      count: subscriptions.length,
      data: subscriptions
    });
  } catch (error) {
    logger.error(`Error fetching upcoming renewals: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get all subscriptions (admin only)
 * @route   GET /api/v1/subscriptions
 * @access  Private/Admin
 */
export const getSubscriptions = async (req, res, next) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Filter options
    const filterOptions = {};
    
    if (req.query.status) {
      filterOptions.status = req.query.status;
    }
    
    if (req.query.category) {
      filterOptions.category = req.query.category;
    }
    
    // For regular users, only show their subscriptions
    if (req.user.role !== 'admin') {
      filterOptions.user = req.user.id;
    }
    
    const total = await Subscription.countDocuments(filterOptions);
    
    const subscriptions = await Subscription.find(filterOptions)
      .limit(limit)
      .skip(startIndex)
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: subscriptions.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: subscriptions
    });
  } catch (error) {
    logger.error(`Error fetching subscriptions: ${error.message}`);
    next(error);
  }
};