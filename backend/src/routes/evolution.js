import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { aiGenerationRateLimiter } from '../middleware/rateLimiter.js';
import { getUserSessions } from '../services/firestore.js';
import { analyzeThoughtEvolution } from '../services/gemini.js';

const router = express.Router();

router.use(authenticateToken);

/**
 * POST /api/evolution/analyze
 * Original Feature Endpoint: Synthesizes cross-session thought evolution and performs semantic journal Q&A.
 * Strictly queries users/{req.user.uid}/sessions.
 */
router.post('/analyze', aiGenerationRateLimiter, async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const { query = '' } = req.body;

    // 1. Fetch user's sessions strictly scoped to req.user.uid
    const userSessions = await getUserSessions(uid);

    // 2. Perform Thought Evolution Analysis with Gemini
    const evolutionReport = await analyzeThoughtEvolution(userSessions, query.trim());

    res.json({
      report: evolutionReport,
      analyzedSessionsCount: userSessions.length,
      timestamp: new Date().toISOString(),
      user: uid
    });
  } catch (error) {
    next(error);
  }
});

export default router;
