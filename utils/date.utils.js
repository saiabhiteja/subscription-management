import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter.js';
import duration from 'dayjs/plugin/duration.js';

// Extend dayjs with plugins
dayjs.extend(relativeTime);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(duration);

/**
 * Format date in a human-readable format
 * @param {Date|String} date - Date to format
 * @param {String} format - Format string
 * @returns {String} Formatted date
 */
export const formatDate = (date, format = 'MMM D, YYYY') => {
  return dayjs(date).format(format);
};

/**
 * Get relative time (e.g., "2 days ago", "in 3 months")
 * @param {Date|String} date - Date to compare with now
 * @returns {String} Relative time
 */
export const getRelativeTime = (date) => {
  return dayjs(date).fromNow();
};

/**
 * Calculate days remaining until a date
 * @param {Date|String} futureDate - Future date
 * @returns {Number} Days remaining
 */
export const getDaysRemaining = (futureDate) => {
  const now = dayjs();
  const future = dayjs(futureDate);
  
  if (now.isAfter(future)) {
    return 0;
  }
  
  return future.diff(now, 'day');
};

/**
 * Check if a date is within a specific range
 * @param {Date|String} date - Date to check
 * @param {Date|String} start - Start date
 * @param {Date|String} end - End date
 * @returns {Boolean} Whether the date is within range
 */
export const isDateInRange = (date, start, end) => {
  const checkDate = dayjs(date);
  return checkDate.isSameOrAfter(start) && checkDate.isSameOrBefore(end);
};

/**
 * Calculate renewal period dates based on frequency
 * @param {Date|String} startDate - Start date
 * @param {String} frequency - 'daily', 'weekly', 'monthly', or 'yearly'
 * @returns {Object} Next renewal date
 */
export const calculateNextRenewalDate = (startDate, frequency) => {
  const start = dayjs(startDate);
  let nextRenewal;
  
  switch (frequency) {
    case 'daily':
      nextRenewal = start.add(1, 'day');
      break;
    case 'weekly':
      nextRenewal = start.add(1, 'week');
      break;
    case 'monthly':
      nextRenewal = start.add(1, 'month');
      break;
    case 'yearly':
      nextRenewal = start.add(1, 'year');
      break;
    default:
      nextRenewal = start.add(1, 'month');
  }
  
  return nextRenewal.toDate();
};

/**
 * Calculate all reminder dates for a renewal
 * @param {Date|String} renewalDate - Renewal date
 * @param {Array} reminderDays - Array of days before renewal for reminders
 * @returns {Array} Array of reminder dates
 */
export const calculateReminderDates = (renewalDate, reminderDays = [7, 5, 2, 1]) => {
  const renewal = dayjs(renewalDate);
  
  return reminderDays.map(days => {
    return {
      days,
      date: renewal.subtract(days, 'day').toDate()
    };
  });
};

export default {
  formatDate,
  getRelativeTime,
  getDaysRemaining,
  isDateInRange,
  calculateNextRenewalDate,
  calculateReminderDates
};