import { Router} from 'express';
import { sendReminders, cancelSubscriptionReminders } from '../controllers/workflow.controller.js';

const workflowRouter = Router();

/**
 * @route POST /api/v1/workflows/subscriptions/reminder
 * @desc Trigger subscription reminder workflow
 * @access Private (through QStash token)
 */
workflowRouter.post('/subscriptions/reminder', sendReminders);

/**
 * @route POST /api/v1/workflows/subscriptions/cancel
 * @desc Cancel subscription reminder workflow
 * @access Private (through QStash token)
 */
workflowRouter.post('/subscriptions/cancel', cancelSubscriptionReminders);

export default workflowRouter;