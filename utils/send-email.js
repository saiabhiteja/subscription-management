import { emailTemplates } from './email-template.js';
import dayjs from 'dayjs';
import transporter, { accountEmail } from '../config/nodemailer.js';
import logger from './logger.js';
import { NODE_ENV } from '../config/env.js';

/**
 * Send an email reminder for a subscription
 * @param {Object} params - Email parameters
 * @param {String} params.to - Recipient email address
 * @param {String} params.type - Email type (from emailTemplates)
 * @param {Object} params.subscription - Subscription object
 * @returns {Promise} - Promise that resolves when email is sent
 */
export const sendReminderEmail = async ({ to, type, subscription }) => {
  try {
    if (!to || !type) {
      throw new Error('Missing required parameters: to, type');
    }

    const template = emailTemplates.find((t) => t.label === type);

    if (!template) {
      throw new Error(`Invalid email type: ${type}`);
    }

    // Prepare email data
    const mailInfo = {
      userName: subscription.user.name,
      subscriptionName: subscription.name,
      renewalDate: dayjs(subscription.renewalDate).format('MMM D, YYYY'),
      planName: subscription.name,
      price: `${subscription.currency} ${subscription.price} (${subscription.frequency})`,
      paymentMethod: subscription.paymentMethod,
      accountSettingsLink: `${process.env.CLIENT_URL || 'https://subdub.example.com'}/account/settings`,
      supportLink: `${process.env.CLIENT_URL || 'https://subdub.example.com'}/support`,
    };

    const message = template.generateBody(mailInfo);
    const subject = template.generateSubject(mailInfo);

    // Skip actual email sending in test environment
    if (NODE_ENV === 'test') {
      logger.info(`[TEST] Email would be sent to ${to} with subject: ${subject}`);
      return {
        success: true,
        messageId: 'test-message-id',
      };
    }

    // Configure email options
    const mailOptions = {
      from: `"SubDub" <${accountEmail}>`,
      to,
      subject,
      html: message,
      // Add reply-to if needed
      replyTo: accountEmail,
      // Add categories for email tracking
      headers: {
        'X-Category': 'subscription-reminder',
        'X-Reminder-Type': type,
      },
    };

    // Send email
    return new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          logger.error(`Email sending failed: ${error.message}`);
          reject(error);
          return;
        }

        logger.info(`Email sent: ${info.messageId}`);
        resolve({
          success: true,
          messageId: info.messageId,
          response: info.response,
        });
      });
    });
  } catch (error) {
    logger.error(`Error in sendReminderEmail: ${error.message}`);
    throw error;
  }
};

/**
 * Send a welcome email to a new user
 * @param {Object} user - User object
 * @returns {Promise} - Promise that resolves when email is sent
 */
export const sendWelcomeEmail = async (user) => {
  try {
    // Welcome email template would be added to emailTemplates
    const welcomeTemplate = emailTemplates.find((t) => t.label === 'welcome');
    
    if (!welcomeTemplate) {
      logger.warn('Welcome email template not found');
      return { success: false, error: 'Template not found' };
    }

    const mailInfo = {
      userName: user.name,
      accountSettingsLink: `${process.env.CLIENT_URL || 'https://subdub.example.com'}/account/settings`,
      supportLink: `${process.env.CLIENT_URL || 'https://subdub.example.com'}/support`,
    };

    const message = welcomeTemplate.generateBody(mailInfo);
    const subject = welcomeTemplate.generateSubject(mailInfo);

    // Skip actual email sending in test environment
    if (NODE_ENV === 'test') {
      logger.info(`[TEST] Welcome email would be sent to ${user.email}`);
      return {
        success: true,
        messageId: 'test-welcome-email',
      };
    }

    const mailOptions = {
      from: `"SubDub" <${accountEmail}>`,
      to: user.email,
      subject,
      html: message,
      replyTo: accountEmail,
      headers: {
        'X-Category': 'welcome',
      },
    };

    return new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          logger.error(`Welcome email failed: ${error.message}`);
          reject(error);
          return;
        }

        logger.info(`Welcome email sent to ${user.email}: ${info.messageId}`);
        resolve({
          success: true,
          messageId: info.messageId,
        });
      });
    });
  } catch (error) {
    logger.error(`Error in sendWelcomeEmail: ${error.message}`);
    throw error;
  }
};

/**
 * Send a password reset email
 * @param {Object} params - Email parameters
 * @param {String} params.to - Recipient email
 * @param {String} params.resetToken - Password reset token
 * @param {String} params.userName - User's name
 * @returns {Promise} - Promise that resolves when email is sent
 */
export const sendPasswordResetEmail = async ({ to, resetToken, userName }) => {
  try {
    if (!to || !resetToken) {
      throw new Error('Missing required parameters: to, resetToken');
    }

    // Reset password template would be added to emailTemplates
    const resetTemplate = emailTemplates.find((t) => t.label === 'password_reset');
    
    if (!resetTemplate) {
      logger.warn('Password reset email template not found');
      return { success: false, error: 'Template not found' };
    }

    const resetLink = `${process.env.CLIENT_URL || 'https://subdub.example.com'}/reset-password/${resetToken}`;
    
    const mailInfo = {
      userName: userName || 'User',
      resetLink,
      supportLink: `${process.env.CLIENT_URL || 'https://subdub.example.com'}/support`,
    };

    const message = resetTemplate.generateBody(mailInfo);
    const subject = resetTemplate.generateSubject(mailInfo);

    if (NODE_ENV === 'test') {
      logger.info(`[TEST] Password reset email would be sent to ${to}`);
      return {
        success: true,
        messageId: 'test-reset-email',
      };
    }

    const mailOptions = {
      from: `"SubDub Security" <${accountEmail}>`,
      to,
      subject,
      html: message,
      replyTo: accountEmail,
      headers: {
        'X-Category': 'password-reset',
      },
    };

    return new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          logger.error(`Password reset email failed: ${error.message}`);
          reject(error);
          return;
        }

        logger.info(`Password reset email sent to ${to}: ${info.messageId}`);
        resolve({
          success: true,
          messageId: info.messageId,
        });
      });
    });
  } catch (error) {
    logger.error(`Error in sendPasswordResetEmail: ${error.message}`);
    throw error;
  }
};