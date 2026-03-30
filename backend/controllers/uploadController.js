/**
 * controllers/uploadController.js
 * Rewritten to support Kernel404 relational schema.
 */

const xlsx = require('xlsx');
const fs   = require('fs');
const prisma = require('../config/prisma');
const { chunkArray } = require('../utils/chunkArray');

/**
 * POST /api/data/upload
 * Process Excel/CSV files and map string labels to database IDs.
 */
const uploadData = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an Excel or CSV file.' });
    }

    const filePath = req.file.path;

    // 1. Load Master Data for Mapping (Cache in memory)
    const [provinces, categories, departments] = await Promise.all([
      prisma.province.findMany({ select: { id: true, name: true, regionId: true } }),
      prisma.category.findMany({ select: { id: true, name: true } }),
      prisma.department.findMany({ select: { id: true, name: true } }),
    ]);

    // Create lookup maps (normalize strings to uppercase for case-insensitive matching)
    const provinceMap   = Object.fromEntries(provinces.map((p) => [p.name.toUpperCase(), p]));
    const categoryMap   = Object.fromEntries(categories.map((c) => [c.name.toUpperCase(), c.id]));
    const departmentMap = Object.fromEntries(departments.map((d) => [d.name.toUpperCase(), d.id]));

    // 2. Read File
    const workbook  = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const rawData   = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: null });

    if (rawData.length === 0) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(400).json({ success: false, message: 'File is empty' });
    }

    // 3. Mapping Logic
    const mappedData = [];
    const errors     = [];

    rawData.forEach((row, index) => {
      // Normalize names from row
      const pName = row.Province   ? String(row.Province).trim().toUpperCase()   : '';
      const cName = row.Category   ? String(row.Category).trim().toUpperCase()   : 'DỊCH VỤ'; // default category
      const dName = row.Department ? String(row.Department).trim().toUpperCase() : 'KINH DOANH'; // default dept

      const provinceObj = provinceMap[pName];
      const categoryId  = categoryMap[cName];
      const departmentId = departmentMap[dName];

      // Verification: if essential mapping fails, log error for this row
      if (!provinceObj) {
        errors.push(`Row ${index + 2}: Province "${row.Province}" not found in system.`);
        return;
      }

      let dateVal = row.Order_Date ? new Date(row.Order_Date) : new Date();
      if (isNaN(dateVal.getTime())) dateVal = new Date();

      mappedData.push({
        orderDate:    dateVal,
        revenue:      parseFloat(row.Revenue || 0),
        cost:         parseFloat(row.Cost || (row.Revenue * 0.5) || 0),
        quantity:     parseInt(row.Quantity || 1, 10),
        regionId:     provinceObj.regionId,
        provinceId:   provinceObj.id,
        categoryId:   categoryId   || categories[0]?.id, // fallback
        departmentId: departmentId || departments[0]?.id, // fallback
      });
    });

    // 4. Batch Insert
    const BATCH_SIZE    = 1000;
    const batches       = chunkArray(mappedData, BATCH_SIZE);
    let totalInserted = 0;

    for (const batch of batches) {
      const result = await prisma.kernel404.createMany({
        data: batch,
        skipDuplicates: false
      });
      totalInserted += result.count;
    }

    // Cleanup
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    return res.status(200).json({
      success: true,
      message: 'Data import completed.',
      summary: {
        totalRows:     rawData.length,
        totalInserted: totalInserted,
        failedRows:    errors.length,
      },
      errors: errors.slice(0, 10) // Only send first 10 errors to avoid huge response
    });

  } catch (error) {
    console.error('[uploadController] error:', error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return res.status(500).json({ success: false, message: 'Server error during data import: ' + error.message });
  }
};

module.exports = { uploadData };
