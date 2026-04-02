const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');

// Chỉ ADMIN, DIRECTOR và MANAGER mới được quản lý users cấp dưới
router.use(requireAuth);
router.use(requireRole(['ADMIN', 'DIRECTOR', 'MANAGER']));

router.get('/', userController.getUsers);
router.post('/', userController.createUser);
router.put('/:id/permissions', userController.updatePermissions);

module.exports = router;
