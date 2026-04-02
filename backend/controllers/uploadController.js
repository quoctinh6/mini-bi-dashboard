/**
 * controllers/uploadController.js
 * Supports Kernel404 relational schema.
 * Column matching is FUZZY (uses .includes()) - supports Vietnamese & English headers.
 * Verified against actual export file columns:
 *   "Mã ID", "Ngày giao dịch", "Ngành hàng", "Khu vực", "Tỉnh thành",
 *   "Phòng ban", "Doanh thu (VND)", "Chi phí (VND)", "Số lượng"
 */

const xlsx = require('xlsx');
const fs   = require('fs');
const prisma = require('../config/prisma');
const { chunkArray } = require('../utils/chunkArray');

/**
 * POST /api/data/upload
 */
const uploadData = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an Excel or CSV file.' });
    }

    const filePath = req.file.path;

    // 1. Load Master Data for Mapping
    const [provinces, categories, departments] = await Promise.all([
      prisma.province.findMany({ select: { id: true, name: true, regionId: true } }),
      prisma.category.findMany({ select: { id: true, name: true } }),
      prisma.department.findMany({ select: { id: true, name: true } }),
    ]);

    // Chuẩn hóa chuỗi: NFC + trim + toUpperCase
    const norm = (str) => str ? String(str).normalize('NFC').trim().toUpperCase() : '';

    // Lookup maps (key = normalized name)
    const provinceMap   = Object.fromEntries(provinces.map(p   => [norm(p.name), p]));
    const categoryMap   = Object.fromEntries(categories.map(c  => [norm(c.name), c.id]));
    const departmentMap = Object.fromEntries(departments.map(d => [norm(d.name), d.id]));

    // 2. Read File
    const workbook  = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const rawData   = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: null });

    if (rawData.length === 0) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(400).json({ success: false, message: 'File is empty' });
    }

    // Log first row for debugging (will appear in Docker logs)
    console.log('[uploadController] First row keys:', Object.keys(rawData[0]));
    console.log('[uploadController] First row sample:', rawData[0]);

    // 3. Mapping & ETL
    const mappedData = [];
    const errors     = [];

    rawData.forEach((row, index) => {
      // Normalize all column KEYS so we can do fuzzy matching on them
      const nRow = {};
      Object.keys(row).forEach(k => { nRow[norm(k)] = row[k]; });

      // Fuzzy-match each column (supports both Vietnamese & English headers)
      let rawProvince, rawCategory, rawDepartment, rawOrderDate, rawRevenue, rawCost, rawQuantity;
      Object.keys(nRow).forEach(k => {
        if (k.includes('TỈNH') || k.includes('PROVINCE'))          rawProvince    = nRow[k];
        if (k.includes('NGÀNH') || k.includes('CATEGORY'))         rawCategory    = nRow[k];
        if (k.includes('PHÒNG') || k.includes('DEPARTMENT'))       rawDepartment  = nRow[k];
        if (k.includes('NGÀY') || k.includes('ORDER'))             rawOrderDate   = nRow[k];
        if (k.includes('DOANH') || k.includes('REVENUE'))          rawRevenue     = nRow[k];
        if (k.includes('CHI') || k.includes('COST'))               rawCost        = nRow[k];
        if (k.includes('SỐ') || k.includes('QUANTITY') || k.includes('QTY')) rawQuantity = nRow[k];
      });

      // Map to DB IDs
      const pName = rawProvince   ? norm(rawProvince)   : norm(provinces[0]?.name   || 'Hà Nội');
      const cName = rawCategory   ? norm(rawCategory)   : norm(categories[0]?.name  || 'Dịch vụ');
      const dName = rawDepartment ? norm(rawDepartment) : norm(departments[0]?.name || 'Kinh doanh');

      const provinceObj  = provinceMap[pName]   || provinces[0];
      const categoryId   = categoryMap[cName]   || categories[0]?.id;
      const departmentId = departmentMap[dName] || departments[0]?.id;

      if (!provinceObj) {
        errors.push(`Row ${index + 2}: Không tìm thấy tỉnh '${pName}'`);
        return;
      }

      // Parse date
      let dateVal = new Date();
      if (rawOrderDate) {
        if (typeof rawOrderDate === 'number') {
          // Excel serial → JS Date
          dateVal = new Date(Math.round((rawOrderDate - 25569) * 86400 * 1000));
        } else {
          dateVal = new Date(rawOrderDate);
        }
        if (isNaN(dateVal.getTime())) dateVal = new Date();
      }

      // Parse revenue & cost (remove thousands commas)
      const revenue  = parseFloat(String(rawRevenue ?? 0).replace(/,/g, ''))  || 0;
      const cost     = parseFloat(String(rawCost    ?? 0).replace(/,/g, ''))  || 0;
      const quantity = parseInt(rawQuantity ?? 1, 10) || 1;

      mappedData.push({
        orderDate:    dateVal,
        revenue,
        cost,
        quantity,
        regionId:     provinceObj.regionId,
        provinceId:   provinceObj.id,
        categoryId,
        departmentId,
      });
    });

    // 4. Batch Insert
    const BATCH_SIZE = 1000;
    const batches    = chunkArray(mappedData, BATCH_SIZE);
    let totalInserted = 0;

    for (const batch of batches) {
      const result = await prisma.kernel404.createMany({ data: batch, skipDuplicates: false });
      totalInserted += result.count;
    }

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    return res.status(200).json({
      success: true,
      message: 'Data import completed.',
      summary: {
        totalRows:     rawData.length,
        totalInserted,
        failedRows:    errors.length,
      },
      errors: errors.slice(0, 10),
    });

  } catch (error) {
    console.error('[uploadController] error:', error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

module.exports = { uploadData };
