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

    // 2. Tạo dữ liệu giả ngẫu nhiên
    const numRecords = Math.floor(Math.random() * 30) + 20; // 20-50 records
    const simulatedData = [];

    // Helper random
    const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const getRandomRevenue = () => Math.floor(Math.random() * 50000) + 1000; 

    // Lấy ngày hiện tại
    const today = new Date();

    for (let i = 0; i < numRecords; i++) {
      const province = getRandomElement(provinces);
      const category = getRandomElement(categories);
      const department = getRandomElement(departments);

      const revenue = getRandomRevenue();
      const cost = revenue * (0.3 + Math.random() * 0.4); // chi phí = 30-70% doanh thu
      
      // Ngày ngẫu nhiên trong vòng 30 ngày qua
      const randDays = Math.floor(Math.random() * 30);
      const orderDate = new Date(today);
      orderDate.setDate(orderDate.getDate() - randDays);

      simulatedData.push({
        orderDate,
        revenue,
        cost,
        quantity: Math.floor(Math.random() * 10) + 1,
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
        source: 'Simulated API Engine'
      }
    });
  } catch (error) {
    console.error('[integrationController.js] simulateApiSync error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi đồng bộ API ERP: ' + error.message });
  }
};

module.exports = { simulateApiSync };
