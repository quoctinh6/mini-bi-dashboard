const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');

router.use(requireAuth);
router.use(requireRole(['ADMIN', 'DIRECTOR'])); // Chỉ Giám đốc/Admin được test mail

router.post('/test-email', settingsController.sendTestEmail);

module.exports = router;
