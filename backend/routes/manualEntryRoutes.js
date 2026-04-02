const express = require('express');
const router = express.Router();
const { createManualEntry, getTransactions, updateManualEntry, exportTransactions } = require('../controllers/manualEntryController');
const { requireAuth } = require('../middlewares/authMiddleware');

// All manual data routes require JWT
router.use(requireAuth);

/**
 * GET /api/data/export
 */
router.get('/export', exportTransactions);

/**
 * POST /api/data/manual
 */
router.post('/manual', createManualEntry);

/**
 * PUT /api/data/manual/:id
 */
router.put('/manual/:id', updateManualEntry);

/**
 * GET /api/data/transactions
 */
router.get('/transactions', getTransactions);

module.exports = router;
