/**
 * controllers/manualEntryController.js
 * Rewritten to use the new Kernel404 schema (MySQL).
 */

const { buildRlsFilter } = require('../services/rlsService');
const XLSX = require('xlsx');
const prisma = require('../config/prisma');

/**
 * Shared helper to build where clause based on query params and RLS
 */
const _buildWhereClause = async (user, query) => {
  const { 
    category, 
    region, 
    minRevenue, 
    maxRevenue, 
    startDate, 
    endDate, 
    searchId,
    province,
    department
  } = query;

  const rlsFilter = await buildRlsFilter(user, prisma);
  const whereClause = { ...rlsFilter };

  if (searchId) {
    whereClause.id = parseInt(searchId, 10);
    if (isNaN(whereClause.id)) delete whereClause.id;
  }

  if (category && category !== 'All' && category !== 'null' && category !== 'undefined') {
    const catId = parseInt(category, 10);
    if (!isNaN(catId)) whereClause.categoryId = catId;
  }

  if (region && region !== 'All' && region !== 'null' && region !== 'undefined') {
    const regId = parseInt(region, 10);
    if (!isNaN(regId)) whereClause.regionId = regId;
  }

  if (province && province !== 'All' && province !== 'null' && province !== 'undefined') {
    const provId = parseInt(province, 10);
    if (!isNaN(provId)) whereClause.provinceId = provId;
  }

  if (department && department !== 'All' && department !== 'null' && department !== 'undefined') {
    const depId = parseInt(department, 10);
    if (!isNaN(depId)) whereClause.departmentId = depId;
  }

  if (minRevenue || maxRevenue) {
    const gte = parseFloat(minRevenue);
    const lte = parseFloat(maxRevenue);
    if (!isNaN(gte) || !isNaN(lte)) {
       whereClause.revenue = {};
       if (!isNaN(gte)) whereClause.revenue.gte = gte;
       if (!isNaN(lte)) whereClause.revenue.lte = lte;
    }
  }

  if ((startDate && startDate !== 'null' && startDate !== 'undefined') || 
      (endDate && endDate !== 'null' && endDate !== 'undefined')) {
    whereClause.orderDate = {};
    if (startDate && startDate !== 'null' && startDate !== 'undefined') {
        whereClause.orderDate.gte = new Date(startDate);
    }
    if (endDate && endDate !== 'null' && endDate !== 'undefined') {
        const endObj = new Date(endDate);
          endObj.setHours(23, 59, 59, 999);
        whereClause.orderDate.lte = endObj;
    }
  }

  console.log('[manualEntryController] Final WhereClause:', JSON.stringify(whereClause, null, 2));
  return whereClause;
};

/**
 * GET /api/data/transactions
 */
const getTransactions = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'orderDate',
      sortDir = 'desc' 
    } = req.query;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const whereClause = await _buildWhereClause(req.user, req.query);

    // Sanitize sort variables
    const finalSortDir = (sortDir === 'asc' || sortDir === 'desc') ? sortDir : 'desc';

    // Build OrderBy
    let orderConfig = {};
    if (sortBy === 'date') orderConfig.orderDate = finalSortDir;
    else if (sortBy === 'id') orderConfig.id = finalSortDir;
    else if (sortBy === 'revenue') orderConfig.revenue = finalSortDir;
    else if (sortBy === 'cost') orderConfig.cost = finalSortDir;
    else if (sortBy === 'category') orderConfig.category = { name: finalSortDir };
    else if (sortBy === 'region') orderConfig.region = { name: finalSortDir };
    else orderConfig.orderDate = finalSortDir;

    const [total, transactions] = await Promise.all([
      prisma.kernel404.count({ where: whereClause }),
      prisma.kernel404.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: orderConfig,
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

/**
 * GET /api/data/export
 * Export transactions to Excel (.xlsx) based on filters
 */
const exportTransactions = async (req, res) => {
  res.setTimeout(0); // Disable timeout for this request
  try {
    const { columns } = req.query;
    console.log('[manualEntryController] === BẮT ĐẦU XUẤT EXCEL ===');
    console.log('[manualEntryController] Params nhận được:', req.query);
    
    const whereClause = await _buildWhereClause(req.user, req.query);

    // (1/3) Fetch 50k records efficiently
    console.log('[manualEntryController] (1/3) Đang truy vấn database cho 50,000 dòng...');
    const transactions = await prisma.kernel404.findMany({
      where: whereClause,
      include: {
        region:   { select: { name: true } },
        province: { select: { name: true } },
        category: { select: { name: true } },
        department: { select: { name: true } }
      },
      orderBy: { orderDate: 'desc' }
    });
    console.log(`[manualEntryController] (2/3) Đã lấy xong ${transactions.length} bản ghi.`);

    const headerMap = {
      'id': 'Mã ID',
      'date': 'Ngày giao dịch',
      'category': 'Ngành hàng',
      'region': 'Khu vực',
      'province': 'Tỉnh thành',
      'department': 'Phòng ban',
      'revenue': 'Doanh thu (VND)',
      'cost': 'Chi phí (VND)',
      'quantity': 'Số lượng'
    };

    const selectedKeys = columns ? columns.split(',') : Object.keys(headerMap);
    const headers = selectedKeys.map(k => headerMap[k]).join(',');

    // (3/3) Send CSV Stream for performance on 50k rows
    console.log('[manualEntryController] (3/3) Đang phát (streaming) dữ liệu CSV về máy khách...');
    
    // Set headers for CSV
    res.setHeader('Content-Disposition', `attachment; filename=data_export_${new Date().getTime()}.csv`);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    
    // Add UTF-8 BOM for Excel visibility
    res.write('\uFEFF');
    res.write(headers + '\n');

    transactions.forEach(t => {
      const row = selectedKeys.map(key => {
        let val = '';
        if (key === 'id') val = t.id;
        else if (key === 'date') val = t.orderDate.toISOString().split('T')[0];
        else if (key === 'category') val = t.category?.name || 'N/A';
        else if (key === 'region') val = t.region?.name || 'N/A';
        else if (key === 'province') val = t.province?.name || 'N/A';
        else if (key === 'department') val = t.department?.name || 'N/A';
        else if (key === 'revenue') val = Number(t.revenue);
        else if (key === 'cost') val = Number(t.cost);
        else if (key === 'quantity') val = t.quantity;
        
        // Escape commas and wrap in quotes for CSV safety
        const strVal = String(val).replace(/"/g, '""');
        return `"${strVal}"`;
      }).join(',');
      res.write(row + '\n');
    });

    return res.end();
  } catch (error) {
    console.error('[manualEntryController] export error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to export Excel file' });
  }
};

/**
 * POST /api/data/manual
 */
const createManualEntry = async (req, res) => {
  try {
    const prisma = require('../config/prisma');
    const { 
      orderDate, 
      revenue, 
      cost, 
      quantity, 
      provinceId, 
      categoryId, 
      departmentId 
    } = req.body;

    if (!orderDate || !revenue || !provinceId || !categoryId || !departmentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    const province = await prisma.province.findUnique({
      where: { id: parseInt(provinceId, 10) },
      select: { regionId: true }
    });

    if (!province) {
      return res.status(404).json({ success: false, message: 'Province ID not found' });
    }

    const newEntry = await prisma.kernel404.create({
      data: {
        orderDate:    new Date(orderDate),
        revenue:      parseFloat(revenue),
        cost:         parseFloat(cost || (revenue * 0.5)),
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
    console.error('[manualEntryController] create error:', error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * PUT /api/data/manual/:id
 */
const updateManualEntry = async (req, res) => {
  try {
    const prisma = require('../config/prisma');
    const { id } = req.params;
    const { 
      orderDate, 
      revenue, 
      cost, 
      quantity, 
      provinceId, 
      categoryId, 
      departmentId 
    } = req.body;

    if (!orderDate || !revenue || !provinceId || !categoryId || !departmentId) {
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    const province = await prisma.province.findUnique({
      where: { id: parseInt(provinceId, 10) },
      select: { regionId: true }
    });

    if (!province) {
      return res.status(404).json({ success: false, message: 'Province ID not found' });
    }

    const updatedEntry = await prisma.kernel404.update({
      where: { id: parseInt(id, 10) },
      data: {
        orderDate:    new Date(orderDate),
        revenue:      parseFloat(revenue),
        cost:         parseFloat(cost || (revenue * 0.5)),
        quantity:     parseInt(quantity || 1, 10),
        regionId:     province.regionId,
        provinceId:   parseInt(provinceId, 10),
        categoryId:   parseInt(categoryId, 10),
        departmentId: parseInt(departmentId, 10),
      }
    });

    return res.status(200).json({ success: true, data: updatedEntry });
  } catch (error) {
    console.error('[manualEntryController] update error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to update' });
  }
};

module.exports = { createManualEntry, getTransactions, updateManualEntry, exportTransactions };
