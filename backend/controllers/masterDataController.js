/**
 * controllers/masterDataController.js
 * Provides list data for dropdowns (Provinces, Categories, Departments, Regions).
 */

const prisma = require('../config/prisma');

/**
 * GET /api/master/provinces
 */
const getProvinces = async (req, res) => {
  try {
    const data = await prisma.province.findMany({
      orderBy: { name: 'asc' },
      include: { region: { select: { name: true, code: true } } }
    });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('[masterDataController] getProvinces error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error fetching provinces' });
  }
};

/**
 * GET /api/master/categories
 */
const getCategories = async (req, res) => {
  try {
    const data = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('[masterDataController] getCategories error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error fetching categories' });
  }
};

/**
 * GET /api/master/departments
 */
const getDepartments = async (req, res) => {
  try {
    const data = await prisma.department.findMany({ orderBy: { name: 'asc' } });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('[masterDataController] getDepartments error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error fetching departments' });
  }
};

/**
 * GET /api/master/regions
 */
const getRegions = async (req, res) => {
  try {
    const data = await prisma.region.findMany({ orderBy: { name: 'asc' } });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('[masterDataController] getRegions error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error fetching regions' });
  }
};

module.exports = {
  getProvinces,
  getCategories,
  getDepartments,
  getRegions
};
