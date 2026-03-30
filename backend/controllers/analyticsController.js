/**
 * controllers/analyticsController.js
 * Rewritten to use the new Kernel404 schema.
 */

const { getSalesGrouped } = require('../services/dashboardService');
const { buildRlsFilter }  = require('../services/rlsService');
const prisma = require('../config/prisma');

/**
 * GET /api/analytics/sales
 * Groups transaction revenue by Date | Province | Department | Category
 * Query params: groupBy, startDate, endDate, department
 */
const getSalesData = async (req, res) => {
  try {
    const { startDate, endDate, department, groupBy = 'Date' } = req.query;

    const data = await getSalesGrouped(req.user, {
      startDate,
      endDate,
      department,
      groupBy,
    });

    return res.status(200).json({ success: true, data });
  } catch (err) {
    const status = err.status || 500;
    console.error('[analyticsController] getSalesData error:', err.message);
    return res.status(status).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/analytics/metrics
 * Returns KPI summary: totalRevenue, growthRate, target vs actual.
 * Lightweight version of the full overview (no chart breakdown).
 */
const getMetrics = async (req, res) => {
  try {
    const rlsWhere = await buildRlsFilter(req.user, prisma);
    const year     = parseInt(req.query.year || new Date().getFullYear(), 10);

    const [current, previous, targets] = await Promise.all([
      prisma.kernel404.aggregate({
        where: {
          ...rlsWhere,
          orderDate: {
            gte: new Date(`${year}-01-01`),
            lte: new Date(`${year}-12-31`),
          },
        },
        _sum:   { revenue: true, cost: true },
        _count: { id: true },
      }),
      prisma.kernel404.aggregate({
        where: {
          ...rlsWhere,
          orderDate: {
            gte: new Date(`${year - 1}-01-01`),
            lte: new Date(`${year - 1}-12-31`),
          },
        },
        _sum: { revenue: true },
      }),
      prisma.target.aggregate({
        where: {
          year,
          ...(rlsWhere.regionId ? { regionId: { in: rlsWhere.regionId.in } } : {}),
        },
        _sum: { revenue: true },
      }),
    ]);

    const totalRevenue  = Number(current._sum.revenue || 0);
    const totalCost     = Number(current._sum.cost    || 0);
    const prevRevenue   = Number(previous._sum.revenue || 0);
    const totalTarget   = Number(targets._sum.revenue  || 0);
    const totalOrders   = current._count.id || 0;

    const growthRate = prevRevenue > 0
      ? parseFloat((((totalRevenue - prevRevenue) / prevRevenue) * 100).toFixed(2))
      : 0;

    const targetAchievement = totalTarget > 0
      ? parseFloat(((totalRevenue / totalTarget) * 100).toFixed(2))
      : null;

    return res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalCost,
        totalProfit:  totalRevenue - totalCost,
        totalOrders,
        growthRate,
        isPositive:   growthRate >= 0,
        target:       totalTarget,
        targetAchievement,
      },
    });
  } catch (err) {
    console.error('[analyticsController] getMetrics error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error fetching metrics' });
  }
};

module.exports = { getSalesData, getMetrics };
