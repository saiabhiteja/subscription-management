import { Router } from 'express';
import { getUserDashboard, getAdminDashboard } from '../controllers/dashboard.controller.js';
import { authorize, restrictTo } from '../middlewares/auth.middleware.js';

const dashboardRouter = Router();

/**
 * @route   GET /api/v1/dashboard
 * @desc    Get user dashboard data
 * @access  Private
 */
dashboardRouter.get('/', authorize, getUserDashboard);

/**
 * @route   GET /api/v1/dashboard/admin
 * @desc    Get admin dashboard data
 * @access  Private/Admin
 */
dashboardRouter.get('/admin', authorize, restrictTo('admin'), getAdminDashboard);

export default dashboardRouter;