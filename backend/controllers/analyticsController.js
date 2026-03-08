const prisma = require('../config/prisma');

/**
 * GET /api/analytics/sales
 * Trả về mảng dữ liệu đã GROUP BY theo các tiêu chí để vẽ chart
 */
const getSalesData = async (req, res) => {
  try {
    const { startDate, endDate, department, groupBy = 'Date' } = req.query;
    // groupBy có thể là 'Date', 'Province', 'Department'
    
    // 1. Row-level Security (RLS) Filter
    // Lấy thông tin role từ middleware
    const user = req.user; 
    const rlsFilter = {};
    
    if (user && user.role !== 'Giám đốc') {
      // Ví dụ: Trưởng phòng miền Bắc chỉ xem dc zone = Miền Bắc
      if (user.zone && user.zone !== 'All') {
        rlsFilter.Zone = user.zone;
      }
    }

    // 2. Global Filters (Từ người dùng)
    // IMPORTANT FIX: Database có lưu giá trị '0000-00-00' làm Prisma bị lỗi P2020
    // Cần phải parse và filter bỏ những records có date không hợp lệ. Prisma không native support 0000-00-00
    // Ta sử dụng 1970 để lọc các ngày rỗng (hoặc chỉ query where Not Null)
    const queryFilters = { 
        ...rlsFilter,
        Order_Date: {
            gt: new Date('1970-01-01') // Lọc những ngày > 1970 để bỏ qua '0000-00-00'
        }
    };
    
    if (startDate && endDate) {
      queryFilters.Order_Date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }
    
    if (department && department !== 'All') {
      queryFilters.Department = department;
    }

    // 3. Thực hiện tính toán (Aggregated) ở Backend, tuyệt đối không trả 50K dòng raw!
    let data;

    if (groupBy === 'Date') {
       // Group by ngày tháng
       data = await prisma.dashboard_1.groupBy({
         by: ['Order_Date'],
         where: queryFilters,
         _sum: {
           Revenue: true
         },
         orderBy: {
           Order_Date: 'asc'
         }
       });
    } else if (groupBy === 'Province') {
        // Trả về dữ liệu cho Geo Chart Map Việt Nam
       data = await prisma.dashboard_1.groupBy({
         by: ['Province'],
         where: queryFilters,
         _sum: {
           Revenue: true
         }
       });
    } else if (groupBy === 'Department') {
         // Trả về dữ liệu cho Pie Chart hoặc Bar Chart bộ phận
       data = await prisma.dashboard_1.groupBy({
         by: ['Department'],
         where: queryFilters,
         _sum: {
           Revenue: true
         }
       });
    } else {
       return res.status(400).json({ success: false, message: 'Invalid groupBy parameter' });
    }

    // Format lại dữ liệu cho Frontend dễ tiêu thụ
    const formattedData = data.map(item => ({
        label: item.Order_Date ? item.Order_Date.toISOString().split('T')[0] : (item.Province || item.Department || 'Unknown'),
        value: item._sum.Revenue || 0
    }));

    res.status(200).json({ success: true, data: formattedData });
  } catch (error) {
    console.error('Error fetching sales aggregated data:', error);
    res.status(500).json({ success: false, message: 'Server error fetching analytics' });
  }
};

/**
 * GET /api/analytics/metrics
 * Trả về các chỉ số thông minh: Tổng doanh thu, % Tăng trưởng so với kỳ trước
 */
const getMetrics = async (req, res) => {
    try {
        // Để demo thuật toán, ta sẽ tính tổng doanh thu toàn thời gian và giả lập kỳ trước
        
        // 1. Áp dụng RLS
        const user = req.user; 
        const rlsFilter = {};
        if (user && user.role !== 'Giám đốc' && user.zone && user.zone !== 'All') {
          rlsFilter.Zone = user.zone;
        }

        const currentPeriodData = await prisma.dashboard_1.aggregate({
            _sum: { Revenue: true },
            where: rlsFilter
        });
        
        const currentRevenue = currentPeriodData._sum.Revenue || 0;
        
        // GIẢ LẬP: Trưởng phòng thì kỳ trước bán dc ít hơn, Giám đốc thì số lớn hơn
        const previousRevenue = currentRevenue * 0.8; // Giả sử tính đc kỳ trước từ DB

        // Backend Tự động tính tỷ lệ tăng trưởng (Growth rate %)
        let growthRate = 0;
        if (previousRevenue > 0) {
            growthRate = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
        }

        res.status(200).json({ 
            success: true, 
            data: {
                totalRevenue: currentRevenue,
                growthRate: parseFloat(growthRate.toFixed(2)),
                isPositive: growthRate >= 0,
                // Trả thêm số liệu Target cho UI Cảnh báo (nếu < 50% target)
                target: currentRevenue * 1.5 // Giả định target cao gấp rưỡi
            } 
        });

    } catch (error) {
        console.error('Error fetching metrics:', error);
        res.status(500).json({ success: false, message: 'Server error fetching metrics' });
    }
}

module.exports = {
  getSalesData,
  getMetrics
};
