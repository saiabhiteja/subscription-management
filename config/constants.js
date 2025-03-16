// Subscription statuses
export const SUBSCRIPTION_STATUS = {
    ACTIVE: 'active',
    CANCELLED: 'cancelled',
    EXPIRED: 'expired',
    TRIAL: 'trial',
    PAST_DUE: 'pastDue'
  };
  
  // Subscription frequencies
  export const SUBSCRIPTION_FREQUENCY = {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    YEARLY: 'yearly'
  };
  
  // Supported currencies
  export const CURRENCIES = {
    USD: 'USD',
    EUR: 'EUR',
    GBP: 'GBP'
  };
  
  // Subscription categories
  export const SUBSCRIPTION_CATEGORIES = {
    SPORTS: 'sports',
    NEWS: 'news',
    ENTERTAINMENT: 'entertainment',
    LIFESTYLE: 'lifestyle',
    TECHNOLOGY: 'technology',
    FINANCE: 'finance',
    POLITICS: 'politics',
    OTHER: 'other'
  };
  
  // User roles
  export const USER_ROLES = {
    USER: 'user',
    ADMIN: 'admin'
  };
  
  // Reminder days before renewal
  export const REMINDER_DAYS = [7, 5, 2, 1];
  
  // Email types
  export const EMAIL_TYPES = {
    REMINDER_7_DAYS: '7 days before reminder',
    REMINDER_5_DAYS: '5 days before reminder',
    REMINDER_2_DAYS: '2 days before reminder',
    REMINDER_1_DAY: '1 days before reminder',
    WELCOME: 'welcome',
    PASSWORD_RESET: 'password_reset'
  };
  
  // Pagination defaults
  export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
  };
  
  // Rate limiting
  export const RATE_LIMITS = {
    STANDARD_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    STANDARD_MAX_REQUESTS: 100,
    LOGIN_WINDOW_MS: 60 * 60 * 1000, // 1 hour
    LOGIN_MAX_ATTEMPTS: 5
  };
  
  export default {
    SUBSCRIPTION_STATUS,
    SUBSCRIPTION_FREQUENCY,
    CURRENCIES,
    SUBSCRIPTION_CATEGORIES,
    USER_ROLES,
    REMINDER_DAYS,
    EMAIL_TYPES,
    PAGINATION,
    RATE_LIMITS
  };