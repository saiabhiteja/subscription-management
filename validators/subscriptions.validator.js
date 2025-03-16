// validators/subscription.validator.js
import { body } from 'express-validator';

export const createSubscriptionValidator = [
  body('name')
    .notEmpty().withMessage('Subscription name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  
  body('price')
    .notEmpty().withMessage('Price is required')
    .isNumeric().withMessage('Price must be a number')
    .isFloat({ min: 0 }).withMessage('Price must be greater than 0'),
  
  body('currency')
    .isIn(['USD', 'EUR', 'GBP']).withMessage('Currency must be one of: USD, EUR, GBP'),
  
  body('frequency')
    .notEmpty().withMessage('Frequency is required')
    .isIn(['daily', 'weekly', 'monthly', 'yearly']).withMessage('Frequency must be one of: daily, weekly, monthly, yearly'),
  
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['sports', 'news', 'entertainment', 'lifestyle', 'technology', 'finance', 'politics', 'other'])
    .withMessage('Category must be one of: sports, news, entertainment, lifestyle, technology, finance, politics, other'),
  
  body('paymentMethod')
    .notEmpty().withMessage('Payment method is required'),
  
  body('startDate')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Start date must be a valid date')
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      if (date > now) {
        throw new Error('Start date must be in the past or present');
      }
      return true;
    }),
  
  body('renewalDate')
    .optional()
    .isISO8601().withMessage('Renewal date must be a valid date')
    .custom((value, { req }) => {
      const renewalDate = new Date(value);
      const startDate = new Date(req.body.startDate);
      if (renewalDate <= startDate) {
        throw new Error('Renewal date must be after the start date');
      }
      return true;
    })
];

export const updateSubscriptionValidator = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  
  body('price')
    .optional()
    .isNumeric().withMessage('Price must be a number')
    .isFloat({ min: 0 }).withMessage('Price must be greater than 0'),
  
  body('currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP']).withMessage('Currency must be one of: USD, EUR, GBP'),
  
  body('frequency')
    .optional()
    .isIn(['daily', 'weekly', 'monthly', 'yearly']).withMessage('Frequency must be one of: daily, weekly, monthly, yearly'),
  
  body('category')
    .optional()
    .isIn(['sports', 'news', 'entertainment', 'lifestyle', 'technology', 'finance', 'politics', 'other'])
    .withMessage('Category must be one of: sports, news, entertainment, lifestyle, technology, finance, politics, other'),
  
  body('paymentMethod')
    .optional(),
  
  body('status')
    .optional()
    .isIn(['active', 'cancelled', 'expired']).withMessage('Status must be one of: active, cancelled, expired')
];