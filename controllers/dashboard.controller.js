import Subscription from '../models/subscription.model.js';
import User from '../models/user.model.js';
import logger from '../utils/logger.js';

/**
 * @desc    Get user dashboard data
 * @route   GET /api/v1/dashboard
 * @access  Private
 */
export const getUserDashboard = async (req, res, next) => {
  try {
    // Get total active subscriptions count
    const activeSubscriptionsCount = await Subscription.countDocuments({
      user: req.user._id,
      status: 'active'
    });

    // Calculate monthly spending
    const activeSubscriptions = await Subscription.find({
      user: req.user._id,
      status: 'active'
    });

    const monthlyCost = calculateMonthlyCost(activeSubscriptions);

    // Get upcoming renewals in the next 7 days
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const upcomingRenewals = await Subscription.find({
      user: req.user._id,
      status: 'active',
      renewalDate: {
        $gte: new Date(),
        $lte: nextWeek
      }
    }).sort({ renewalDate: 1 });

    // Get subscriptions by category
    const subscriptionsByCategory = await Subscription.aggregate([
      { 
        $match: { 
          user: req.user._id,
          status: 'active'
        } 
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalSpend: { $sum: '$price' }
        }
      },
      {
        $sort: { totalSpend: -1 }
      }
    ]);

    // Recently added subscriptions
    const recentSubscriptions = await Subscription.find({
      user: req.user._id
    })
    .sort({ createdAt: -1 })
    .limit(5);

    res.status(200).json({
      success: true,
      data: {
        activeSubscriptionsCount,
        monthlyCost,
        upcomingRenewals,
        subscriptionsByCategory,
        recentSubscriptions
      }
    });
  } catch (error) {
    logger.error(`Error fetching dashboard data: ${error.message}`);
    next(error);
  }
};

/**
 * Calculate monthly cost from subscriptions with different frequencies
 * @param {Array} subscriptions - List of subscription objects
 * @return {Object} - Monthly cost breakdown by currency
 */
const calculateMonthlyCost = (subscriptions) => {
  const monthlyCost = {};

  subscriptions.forEach(subscription => {
    const { price, frequency, currency } = subscription;
    let monthlyEquivalent = 0;

    switch (frequency) {
      case 'daily':
        monthlyEquivalent = price * 30; // Approximate days in a month
        break;
      case 'weekly':
        monthlyEquivalent = price * 4.33; // Average weeks in a month
        break;
      case 'monthly':
        monthlyEquivalent = price;
        break;
      case 'yearly':
        monthlyEquivalent = price / 12;
        break;
      default:
        monthlyEquivalent = price;
    }

    // Group by currency
    if (!monthlyCost[currency]) {
      monthlyCost[currency] = 0;
    }
    monthlyCost[currency] += monthlyEquivalent;
  });

  // Round all values to 2 decimal places
  Object.keys(monthlyCost).forEach(currency => {
    monthlyCost[currency] = Math.round(monthlyCost[currency] * 100) / 100;
  });

  return monthlyCost;
};

/**
 * @desc    Get admin dashboard data
 * @route   GET /api/v1/dashboard/admin
 * @access  Private/Admin
 */
export const getAdminDashboard = async (req, res, next) => {
  try {
    // Total users
    const totalUsers = await User.countDocuments();

    // New users in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Active subscriptions
    const activeSubscriptions = await Subscription.countDocuments({
      status: 'active'
    });

    // Subscriptions created in last 30 days
    const newSubscriptions = await Subscription.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Top categories
    const topCategories = await Subscription.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        userStats: {
          total: totalUsers,
          new: newUsers
        },
        subscriptionStats: {
          active: activeSubscriptions,
          new: newSubscriptions
        },
        topCategories
      }
    });
  } catch (error) {
    logger.error(`Error fetching admin dashboard data: ${error.message}`);
    next(error);
  }
};