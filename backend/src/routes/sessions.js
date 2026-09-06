import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { aiGenerationRateLimiter } from '../middleware/rateLimiter.js';
import { generateSessionSummary } from '../services/gemini.js';
import { saveUserSession, getUserSessions, getUserSessionById, deleteUserSession } from '../services/firestore.js';

const router = express.Router();

// Enforce Firebase ID Token Authentication on all session routes
router.use(authenticateToken);

/**
 * POST /api/sessions/complete
 * Completes a journal session, generates structured summary, and persists strictly to users/{uid}/sessions
 */
router.post('/complete', aiGenerationRateLimiter, async (req, res, next) => {
  try {
    const { messages = [], title } = req.body;
    const uid = req.user.uid;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Messages array is required to summarize and complete session.',
        code: 'MISSING_MESSAGES'
      });
    }

    // 1. Generate auto-summary using Gemini
    const summary = await generateSessionSummary(messages);

    // 2. Derive session title if not explicitly provided
    const sessionTitle = title || summary.main_topic || `Journal Entry ${new Date().toLocaleDateString()}`;

    // 3. Save to Firestore (strictly scoped to req.user.uid)
    const sessionDoc = await saveUserSession(uid, {
      title: sessionTitle,
      messages,
      summary,
      tags: summary.tags || ['Journal'],
      created_at: new Date().toISOString()
    });

    res.status(201).json({
      message: 'Session completed and summarized successfully.',
      session: sessionDoc
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/sessions
 * List all journal sessions for the authenticated user
 */
router.get('/', async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const sessions = await getUserSessions(uid);
    res.json({
      sessions,
      count: sessions.length,
      uid
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/sessions/:id
 * Retrieve specific session by ID (strictly scoped to req.user.uid)
 */
router.get('/:id', async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const sessionId = req.params.id;

    const session = await getUserSessionById(uid, sessionId);
    if (!session) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Session with ID ${sessionId} not found or access denied.`,
        code: 'SESSION_NOT_FOUND'
      });
    }

    res.json({ session });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/sessions/:id
 * Delete specific session by ID (strictly scoped to req.user.uid)
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const sessionId = req.params.id;

    const success = await deleteUserSession(uid, sessionId);
    if (!success) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Session with ID ${sessionId} not found or access denied.`,
        code: 'SESSION_NOT_FOUND'
      });
    }

    res.json({
      message: `Session ${sessionId} deleted successfully.`,
      sessionId
    });
  } catch (error) {
    next(error);
  }
});

export default router;
