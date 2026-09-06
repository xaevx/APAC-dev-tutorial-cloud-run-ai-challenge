import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { aiGenerationRateLimiter } from '../middleware/rateLimiter.js';
import { generateChatResponse } from '../services/gemini.js';

const router = express.Router();

// Apply auth middleware to all chat endpoints
router.use(authenticateToken);

/**
 * POST /api/chat
 * Multi-turn Gemini conversation endpoint
 */
router.post('/', aiGenerationRateLimiter, async (req, res, next) => {
  try {
    const { history = [], message = '' } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Message field must be a non-empty string.',
        code: 'INVALID_INPUT'
      });
    }

    if (message.length > 8000) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Message exceeds maximum length of 8,000 characters.',
        code: 'MESSAGE_TOO_LONG'
      });
    }

    // Call Gemini Service
    const aiResponse = await generateChatResponse(history, message.trim());

    res.json({
      response: aiResponse,
      timestamp: new Date().toISOString(),
      user: req.user.uid
    });
  } catch (error) {
    next(error);
  }
});

export default router;
