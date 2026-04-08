/**
 * routes/aiRoutes.js
 * AI Chat endpoint — protected by JWT auth.
 */

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middlewares/authMiddleware');
const { chatWithAI } = require('../services/aiService');

// All AI routes require valid JWT
router.use(requireAuth);

/**
 * POST /api/ai/chat
 * Body: { message: string, mode: 'chat' | 'chart', history?: [{role, content}] }
 * Response: { success: true, data: { type, content, widget?, data? } }
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, mode = 'chat', history = [] } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    if (!['chat', 'chart'].includes(mode)) {
      return res.status(400).json({
        success: false,
        message: 'Mode must be "chat" or "chart"',
      });
    }

    // Limit message length
    if (message.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Message too long (max 2000 characters)',
      });
    }

    // Limit history length
    const trimmedHistory = (history || []).slice(-10); // Keep last 10 messages

    const result = await chatWithAI(req.user, message.trim(), mode, trimmedHistory);

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    
    const statusCode = error.message?.includes('GEMINI_API_KEY') ? 503 : 500;
    
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'AI service error',
    });
  }
});

module.exports = router;
