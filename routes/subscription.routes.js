import { Router } from 'express';
import authorize from '../middlewares/auth.middleware.js';
import {
  createSubscription,
  getUserSubscriptions,
  getSubscriptionById,
  updateSubscription,
  deleteSubscription,
  cancelSubscription,
  getUpcomingRenewals
} from '../controllers/subscription.controller.js';
import { createSubscriptionValidator, updateSubscriptionValidator } from '../validators/subscription.validator.js';
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
 * @route DELETE /api/v1/subscriptions/:id
 * @desc Delete subscription
 * @access Private
 */
subscriptionRouter.delete('/:id', 
  [authorize, param('id').isMongoId().withMessage('Invalid subscription ID')],
  validateRequest,
  deleteSubscription
);

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
 * @route GET /api/v1/subscriptions/upcoming-renewals
 * @desc Get upcoming renewals
 * @access Private
 */
subscriptionRouter.get('/upcoming-renewals', authorize, getUpcomingRenewals);

// Stub functions (to be implemented)
function getSubscriptions(req, res, next) {
  // Implementation needed
  res.send({ title: 'GET all subscriptions' });
}
export default subscriptionRouter;