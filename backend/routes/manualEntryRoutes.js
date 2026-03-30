const express = require('express');
const router = express.Router();
const { createManualEntry, getTransactions } = require('../controllers/manualEntryController');
const authMiddleware = require('../middlewares/authMiddleware');

// All manual data routes require JWT
router.use(authMiddleware);

/**
 * POST /api/data/manual
 */
router.post('/manual', createManualEntry);

/**
 * GET /api/data/transactions
 */
router.get('/transactions', getTransactions);

module.exports = router;
