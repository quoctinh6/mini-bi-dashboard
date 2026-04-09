const prisma = require('../config/prisma');
const { chunkArray } = require('../utils/chunkArray');

/**
 * POST /api/data/sync
 * Simulate pulling data from external ERP API into the Kernel404 Dashboard database.
 */
const simulateApiSync = async (req, res) => {
  try {
    // 1. Lấy dữ liệu danh mục để map ngẫu nhiên
    const [provinces, categories, departments] = await Promise.all([
      prisma.province.findMany({ select: { id: true, regionId: true } }),
      prisma.category.findMany({ select: { id: true } }),
      prisma.department.findMany({ select: { id: true } }),
    ]);

    if (!provinces.length || !categories.length || !departments.length) {
      return res.status(400).json({ success: false, message: 'Dữ liệu hệ thống chưa đủ để chạy Auto-Sync.' });
    }

    // 2. Fetch dữ liệu từ ERP API mock hoặc API do user truyền vào
    const axios = require('axios');
    let erpData = [];
    let targetUrl = req.body.apiUrl || 'http://127.0.0.1:5050/transactions';
    
    // Nếu chạy trong Docker, localhost/127.0.0.1 sẽ không trỏ về máy host được.
    // Tự động chuyển đổi để hỗ trợ người dùng test local dễ hơn.
    if (process.env.NODE_ENV === 'production' && (targetUrl.includes('localhost') || targetUrl.includes('127.0.0.1'))) {
       targetUrl = targetUrl.replace('localhost', 'host.docker.internal').replace('127.0.0.1', 'host.docker.internal');
    }

    try {
      const response = await axios.get(targetUrl);
      erpData = response.data;
    } catch (apiErr) {
      return res.status(502).json({ 
        success: false, 
        message: `Không thể kết nối đến ERP API (${targetUrl}). Chi tiết: ${apiErr.message}` 
      });
    }

    if (!Array.isArray(erpData) || erpData.length === 0) {
      return res.status(400).json({ success: false, message: 'ERP API trả về dữ liệu rỗng.' });
    }

    const simulatedData = [];
    const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

    for (const record of erpData) {
      // Để đơn giản cho demo, chúng ta gán ngẫu nhiên ID hợp lệ từ DB thay vì phải cấu hình mapping phức tạp
      const province = getRandomElement(provinces);
      const category = getRandomElement(categories);
      const department = getRandomElement(departments);

      simulatedData.push({
        orderDate: new Date(record.orderDate || new Date()),
        revenue: Number(record.revenue || 0),
        cost: Number(record.cost || 0),
        quantity: Number(record.quantity || 1),
        regionId: province.regionId,
        provinceId: province.id,
        categoryId: category.id,
        departmentId: department.id
      });
    }

    // 3. Batch Insert
    const result = await prisma.kernel404.createMany({
      data: simulatedData,
      skipDuplicates: false
    });

    return res.status(200).json({
      success: true,
      message: 'Đồng bộ API ERP thành công.',
      summary: {
        totalInserted: result.count,
        source: 'Mock ERP API (localhost:5050)'
      }
    });
  } catch (error) {
    console.error('[integrationController.js] simulateApiSync error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi đồng bộ API ERP: ' + error.message });
  }
};

module.exports = { simulateApiSync };
