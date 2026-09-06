import rateLimit from 'express-rate-limit';

// Standard rate limiter for general API routes
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: 'Rate limit exceeded. Please slow down your requests.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

// Stricter rate limiter for Gemini AI Generation endpoints
export const aiGenerationRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP/User to 30 AI generations per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too Many AI Requests',
    message: 'Gemini AI request limit reached for this minute. Please wait briefly.',
    code: 'AI_RATE_LIMIT_EXCEEDED'
  }
});
