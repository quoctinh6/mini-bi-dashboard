const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middlewares/authMiddleware');
const { getSalesData, getMetrics } = require('../controllers/analyticsController');

// Áp dụng middleware RLS cho toàn bộ routes thống kê
router.use(requireAuth);

// Route GET: /api/analytics/sales?groupBy=Date&startDate=...
router.get('/sales', getSalesData);

// Route GET: /api/analytics/metrics
router.get('/metrics', getMetrics);

module.exports = router;
