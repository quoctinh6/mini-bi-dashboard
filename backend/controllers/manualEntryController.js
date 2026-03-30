/**
 * controllers/manualEntryController.js
 * Rewritten to use the new Kernel404 schema (MySQL).
 */

const prisma = require('../config/prisma');

/**
 * POST /api/data/manual
 * Replaces old manual entry system with relational ID mapping.
 */
const createManualEntry = async (req, res) => {
  try {
    const { 
      orderDate, 
      revenue, 
      cost, 
      quantity, 
      provinceId, 
      categoryId, 
      departmentId 
    } = req.body;

    // 1. Validation
    if (!orderDate || !revenue || !provinceId || !categoryId || !departmentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: orderDate, revenue, provinceId, categoryId, departmentId' 
      });
    }

    // 2. Fetch the province to get its linked regionId (RLS requirement)
    const province = await prisma.province.findUnique({
      where: { id: parseInt(provinceId, 10) },
      select: { regionId: true }
    });

    if (!province) {
      return res.status(404).json({ success: false, message: 'Province ID not found' });
    }

    // 3. Create the record in kernel404_transactions
    const newEntry = await prisma.kernel404.create({
      data: {
        orderDate:    new Date(orderDate),
        revenue:      parseFloat(revenue),
        cost:         parseFloat(cost || (revenue * 0.5)), // Defaulting cost to 50% if missing
        quantity:     parseInt(quantity || 1, 10),
        regionId:     province.regionId,
        provinceId:   parseInt(provinceId, 10),
        categoryId:   parseInt(categoryId, 10),
        departmentId: parseInt(departmentId, 10),
      }
    });

    return res.status(201).json({ 
      success: true, 
      message: 'New transaction record saved successfully.', 
      data: newEntry 
    });
  } catch (error) {
    console.error('[manualEntryController] error:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error while saving manual entry' 
    });
  }
};

const { buildRlsFilter } = require('../services/rlsService');

/**
 * GET /api/data/transactions
 * Fetch transaction list with RLS and pagination.
 */
const getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, province } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    // Build RLS Filter based on user's region access
    const rlsFilter = await buildRlsFilter(req.user);

    // Additional query filters
    const whereClause = {
      ...rlsFilter,
    };

    if (category) whereClause.categoryId = parseInt(category, 10);
    if (province) whereClause.provinceId = parseInt(province, 10);

    const [total, transactions] = await Promise.all([
      prisma.kernel404.count({ where: whereClause }),
      prisma.kernel404.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: { orderDate: 'desc' },
        include: {
          region:   { select: { name: true } },
          province: { select: { name: true } },
          category: { select: { name: true } },
          department: { select: { name: true } }
        }
      })
    ]);

    return res.status(200).json({
      success: true,
      data: transactions,
      meta: {
        total,
        page: parseInt(page, 10),
        limit: take,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('[manualEntryController] getTransactions error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error retrieving transactions' });
  }
};

module.exports = { createManualEntry, getTransactions };
