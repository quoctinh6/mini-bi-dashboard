/**
 * routes/dashboardRoutes.js
 */

const express = require('express');
const router  = express.Router();
const authMiddleware     = require('../middlewares/authMiddleware');
const { getOverview }   = require('../controllers/dashboardController');

// All dashboard routes require valid JWT
router.use(authMiddleware);

/**
 * GET /api/dashboard/overview
 * Query params: startDate, endDate, regionId
 *
 * Returns the full KPI + charts aggregated response.
 * RLS is enforced inside dashboardService.
 */
router.get('/overview', getOverview);

module.exports = router;
