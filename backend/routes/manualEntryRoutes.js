const express = require('express');
const router = express.Router();
const { createManualEntry } = require('../controllers/manualEntryController');
const authMiddleware = require('../middlewares/authMiddleware');

// Chỉ cho phép upload manual khi đã xác thực (tuỳ logic thực tế)
router.post('/manual', authMiddleware, createManualEntry);

module.exports = router;
