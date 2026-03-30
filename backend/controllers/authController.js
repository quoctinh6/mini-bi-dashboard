/**
 * controllers/authController.js
 * Generic login with JWT for BI Dashboard.
 */

const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_123';

/**
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    // 1. Find user
    const user = await prisma.user.findUnique({
      where: { username },
      include: { role: true }, // Include role to get its name
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // 2. Check password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // 3. Generate JWT
    const token = jwt.sign(
      { 
        id:   user.id, 
        role: user.role.name 
      }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    // 4. Return success
    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id:       user.id,
        username: user.username,
        fullName: user.fullName,
        role:     user.role.name,
        avatar:   user.avatarUrl,
      },
    });
  } catch (error) {
    console.error('[authController] error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

module.exports = { login };
