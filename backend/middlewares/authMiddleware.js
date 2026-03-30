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
    // Dev mode: no token → default to ADMIN (full access, no RLS)
    // In production, change this to return 401.
    req.user = { id: 1, role: 'ADMIN' };
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    // 2. Decode token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Expected JWT payload: { id: 1, role: 'ADMIN' | 'DIRECTOR' | 'MANAGER' | 'EMPLOYEE' }
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error);
    return res.status(403).json({ success: false, message: 'Invalid token' });
  }
};

module.exports = authMiddleware;
