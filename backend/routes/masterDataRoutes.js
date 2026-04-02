/**
 * routes/masterDataRoutes.js
 * Master data endpoints for dropdowns.
 */

const express = require('express');
const router  = express.Router();
const { requireAuth } = require('../middlewares/authMiddleware'); // Optional, but usually good for BI
const { 
  getProvinces, 
  getCategories, 
  getDepartments, 
  getRegions 
} = require('../controllers/masterDataController');

// All master data routes require JWT (optional)
router.use(requireAuth);

/**
 * GET /api/master/...
 */
router.get('/provinces',   getProvinces);
router.get('/categories',  getCategories);
router.get('/departments', getDepartments);
router.get('/regions',     getRegions);

module.exports = router;
