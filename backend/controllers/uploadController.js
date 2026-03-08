const xlsx = require('xlsx');
const fs = require('fs');
const prisma = require('../config/prisma');
const { chunkArray } = require('../utils/chunkArray');

const uploadData = async (req, res) => {
  try {
    // 1. Kiểm tra xem file có được upload không
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an Excel or CSV file.' });
    }

    const filePath = req.file.path;

    // 2. Đọc file bằng xlsx thành mảng JSON
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: null }); // fill null cho ô trống

    if (rawData.length === 0) {
      // Xóa file tạm
      fs.unlinkSync(filePath);
      return res.status(400).json({ success: false, message: 'File is empty' });
    }

    // 3. (Optional) Basic ETL: Chuẩn hóa dữ liệu trước khi insert, mapping cột nếu cần
    const mappedData = rawData.map((row, index) => {
        let dateVal = row.Order_Date ? new Date(row.Order_Date) : new Date();
        if (isNaN(dateVal.getTime())) {
             dateVal = new Date(); // Fallback nếu parse lỗi
        }

        return {
            Order_ID: row.Order_ID || index + 1000, // Cần 1 ID nếu data ko có
            Order_Date: dateVal,
            Department: row.Department ? String(row.Department).substring(0, 10) : 'Unknown',
            Revenue: parseInt(row.Revenue) || 0,
            Province: row.Province ? String(row.Province).substring(0, 10) : 'Unknown',
            Zone: parseFloat(row.Zone) || 0.00,
        };
    });

    // 4. Chunk array thành các batch nhỏ, max 5000 dòng
    const BATCH_SIZE = 5000;
    const batches = chunkArray(mappedData, BATCH_SIZE);

    let totalInserted = 0;

    // 5. Dùng for...of để insert tuần tự từng batch vào MySQL
    for (const batch of batches) {
      const result = await prisma.dashboard_1.createMany({
        data: batch,
        skipDuplicates: true // bỏ qua nếu trùng lặp (giả định có unique constraint nào đó)
      });
      totalInserted += result.count;
    }

    // Sau khi xử lý xong, xóa file tạm
    fs.unlinkSync(filePath);

    // 6. Trả về response
    return res.status(200).json({
      success: true,
      message: 'Data imported successfully',
      totalRead: rawData.length,
      totalInserted: totalInserted
    });

  } catch (error) {
    console.error('Error importing data:', error);
    // Xóa file tạm nếu có lỗi
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({ success: false, message: 'Server error during data import' });
  }
};

module.exports = {
  uploadData,
};
