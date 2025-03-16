import { Router } from 'express';
import authorize from '../middlewares/auth.middleware.js';
import {
  createSubscription,
  getUserSubscriptions,
  getSubscriptionById,
  updateSubscription,
  deleteSubscription,
  cancelSubscription,
  getUpcomingRenewals,
  getSubscriptions
} from '../controllers/subscriptions.controller.js';
import { createSubscriptionValidator, updateSubscriptionValidator } from '../validators/subscriptions.validator.js';
import validateRequest from '../middlewares/validation.middleware.js';
import { param } from 'express-validator';

const subscriptionRouter = Router();

/**
 * @route GET /api/v1/subscriptions
 * @desc Get all subscriptions (admin only)
 * @access Private/Admin
 */
subscriptionRouter.get('/', authorize, getSubscriptions);

/**
 * @route GET /api/v1/subscriptions/upcoming-renewals
 * @desc Get upcoming renewals
 * @access Private
 */
subscriptionRouter.get('/upcoming-renewals', authorize, getUpcomingRenewals);

/**
 * @route GET /api/v1/subscriptions/user/:id
 * @desc Get user subscriptions
 * @access Private
 */
subscriptionRouter.get('/user/:id', 
  [
    authorize, 
    param('id').isMongoId().withMessage('Invalid user ID')
  ],
  validateRequest,
  getUserSubscriptions
);

/**
 * @route GET /api/v1/subscriptions/:id
 * @desc Get subscription details by ID
 * @access Private
 */
subscriptionRouter.get('/:id', 
  [authorize, param('id').isMongoId().withMessage('Invalid subscription ID')],
  validateRequest,
  getSubscriptionById
);

/**
 * @route POST /api/v1/subscriptions
 * @desc Create a new subscription
 * @access Private
 */
subscriptionRouter.post('/', 
  [authorize, createSubscriptionValidator],
  validateRequest,
  createSubscription
);

/**
 * @route PUT /api/v1/subscriptions/:id
 * @desc Update subscription
 * @access Private
 */
subscriptionRouter.put('/:id', 
  [
    authorize, 
    param('id').isMongoId().withMessage('Invalid subscription ID'),
    updateSubscriptionValidator
  ],
  validateRequest,
  updateSubscription
);

/**
 * @route PUT /api/v1/subscriptions/:id/cancel
 * @desc Cancel subscription
 * @access Private
 */
subscriptionRouter.put('/:id/cancel', 
  [
    authorize, 
    param('id').isMongoId().withMessage('Invalid subscription ID')
  ],
  validateRequest,
  cancelSubscription
);

/**
 * @route DELETE /api/v1/subscriptions/:id
 * @desc Delete subscription
 * @access Private
 */
subscriptionRouter.delete('/:id', 
  [authorize, param('id').isMongoId().withMessage('Invalid subscription ID')],
  validateRequest,
  deleteSubscription
);

export default subscriptionRouter;