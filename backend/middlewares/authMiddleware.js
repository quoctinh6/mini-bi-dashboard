const jwt = require('jsonwebtoken');

// Thay đổi secret key trong thực tế (lưu vào .env)
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_123';

/**
 * Middleware xác thực token và đính kèm thông tin user vào request
 * Dùng cho RLS (Row-level Security)
 */
const authMiddleware = (req, res, next) => {
  // 1. Lấy token từ header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Để cho dễ test ở giai đoạn đầu, nếu không có token ta gán mặc định role Giám đốc
    req.user = { role: 'Giám đốc', zone: 'All' };
    return next();
    // Trong thực tế sẽ return 401
    // return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 2. Decode token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Payload mong đợi: { id: 1, role: 'Trưởng phòng', zone: 'Miền Bắc' }
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error);
    return res.status(403).json({ success: false, message: 'Invalid token' });
  }
};

module.exports = authMiddleware;
