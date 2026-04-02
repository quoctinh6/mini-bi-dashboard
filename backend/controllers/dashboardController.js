/**
 * controllers/dashboardController.js
 * Thin HTTP layer — delegates all logic to dashboardService.
 */

const { getDashboardOverview } = require('../services/dashboardService');

/**
 * GET /api/dashboard/overview
 * Query params: startDate, endDate, regionId (optional)
 *
 * Response 200:
 * {
 *   success: true,
 *   data: { meta, kpi, charts }
 * }
 */
const getOverview = async (req, res) => {
  try {
    const { startDate, endDate, regionId, categoryId } = req.query;

    // req.user is attached by authMiddleware (JWT decoded payload)
    const result = await getDashboardOverview(req.user, {
      startDate,
      endDate,
      regionId,
      categoryId,
    });

    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    const status = err.status || 500;
    console.error('[dashboardController] getOverview error:', err.message);
    return res.status(status).json({
      success: false,
      message: err.message || 'Internal server error',
    });
  }
};

module.exports = { getOverview };
