import dayjs from 'dayjs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { serve } = require("@upstash/workflow/express");
import Subscription from '../models/subscription.model.js';
import { sendReminderEmail } from '../utils/send-email.js';
import logger from '../utils/logger.js';
import { REMINDER_DAYS } from '../config/constants.js';

/**
 * Reminder workflow function
 * Triggered when a subscription is created or updated
 * Manages the reminders for subscription renewals
 */
export const sendReminders = serve(async (context) => {
  try {
    const { subscriptionId } = await context.requestPayload;
    
    if (!subscriptionId) {
      logger.error('No subscription ID provided to workflow');
      return { error: 'No subscription ID provided' };
    }
    
    // Get subscription data
    const subscription = await fetchSubscription(context, subscriptionId);

    // Stop if subscription not found or not active
    if (!subscription) {
      logger.error(`Subscription not found: ${subscriptionId}`);
      return { error: 'Subscription not found' };
    }
    
    if (subscription.status !== 'active') {
      logger.info(`Subscription ${subscriptionId} is not active. Current status: ${subscription.status}`);
      return { message: `Workflow stopped - subscription status is ${subscription.status}` };
    }

    const renewalDate = dayjs(subscription.renewalDate);
    const now = dayjs();

    // Check if renewal date is in the past
    if (renewalDate.isBefore(now)) {
      logger.info(`Renewal date has passed for subscription ${subscriptionId}. Stopping workflow.`);
      
      // Optionally mark subscription as expired
      await context.run('update subscription status', async () => {
        await Subscription.findByIdAndUpdate(subscriptionId, {
          status: 'expired'
        });
      });
      
      return { message: 'Renewal date has passed, subscription marked as expired' };
    }

    // Process each reminder day
    for (const daysBefore of REMINDER_DAYS) {
      const reminderDate = renewalDate.subtract(daysBefore, 'day');
      
      // If the reminder date is in the future, schedule the reminder
      if (reminderDate.isAfter(now)) {
        await scheduleReminder(context, daysBefore, reminderDate, subscription);
      }
      // If today is the reminder day, send the reminder
      else if (now.format('YYYY-MM-DD') === reminderDate.format('YYYY-MM-DD')) {
        await sendReminderForDay(context, daysBefore, subscription);
      }
      // Otherwise the reminder date has passed, log it
      else {
        logger.info(`Reminder date for ${daysBefore} days before has already passed for subscription ${subscriptionId}`);
      }
    }
    
    return { success: true, message: 'Reminders processed successfully' };
  } catch (error) {
    logger.error(`Workflow error: ${error.message}`);
    return { error: error.message };
  }
});

/**
 * Fetch subscription data with user info
 */
const fetchSubscription = async (context, subscriptionId) => {
  return await context.run('get subscription', async () => {
    try {
      const subscription = await Subscription.findById(subscriptionId)
        .populate('user', 'name email')
        .lean(); // Use lean for better performance
      
      if (!subscription) {
        logger.error(`Subscription not found: ${subscriptionId}`);
        return null;
      }
      
      return subscription;
    } catch (error) {
      logger.error(`Error fetching subscription: ${error.message}`);
      throw error;
    }
  });
};

/**
 * Schedule a reminder for a future date
 */
const scheduleReminder = async (context, daysBefore, reminderDate, subscription) => {
  try {
    logger.info(`Scheduling ${daysBefore} days reminder for subscription ${subscription._id} on ${reminderDate.format('YYYY-MM-DD')}`);
    
    const sleepLabel = `Reminder ${daysBefore} days before`;
    await context.sleepUntil(sleepLabel, reminderDate.toDate());
    
    return true;
  } catch (error) {
    logger.error(`Error scheduling reminder: ${error.message}`);
    throw error;
  }
};

/**
 * Send a reminder email for a specific day
 */
const sendReminderForDay = async (context, daysBefore, subscription) => {
  const reminderLabel = `${daysBefore} days before reminder`;
  
  return await context.run(reminderLabel, async () => {
    try {
      logger.info(`Sending ${reminderLabel} for subscription: ${subscription._id}`);
      
      // Make sure we have user data
      if (!subscription.user || !subscription.user.email) {
        throw new Error('User data missing from subscription');
      }
      
      // Send email reminder
      await sendReminderEmail({
        to: subscription.user.email,
        type: reminderLabel,
        subscription,
      });
      
      logger.info(`${reminderLabel} sent successfully to ${subscription.user.email}`);
      return true;
    } catch (error) {
      logger.error(`Error sending ${reminderLabel}: ${error.message}`);
      // We'll still continue the workflow even if one reminder fails
      return false;
    }
  });
};

/**
 * Handles subscription cancellation - stops the workflow
 */
export const cancelSubscriptionReminders = serve(async (context) => {
  try {
    const { subscriptionId } = context.requestPayload;
    
    if (!subscriptionId) {
      logger.error('No subscription ID provided for cancellation');
      return { error: 'No subscription ID provided' };
    }
    
    logger.info(`Cancelling reminders for subscription: ${subscriptionId}`);
    
    // We'll just log the cancellation - the workflow for this subscription 
    // will check the status itself before sending reminders
    return { 
      success: true, 
      message: 'Subscription reminders cancelled' 
    };
  } catch (error) {
    logger.error(`Error cancelling subscription reminders: ${error.message}`);
    return { error: error.message };
  }
});