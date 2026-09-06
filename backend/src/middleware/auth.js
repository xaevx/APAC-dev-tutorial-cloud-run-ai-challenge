import admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp();
    console.log('[FirebaseAdmin] Initialized with default application credentials.');
  } catch (error) {
    console.warn(`[FirebaseAdmin] Warning initializing Firebase Admin: ${error.message}`);
  }
}

/**
 * Express middleware to authenticate requests using Firebase ID Tokens.
 * Derive authenticated user UID strictly from cryptographically verified token.
 */
export async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or invalid Authorization header. Expected Bearer token.',
      code: 'AUTH_HEADER_MISSING'
    });
  }

  const token = authHeader.split('Bearer ')[1].trim();

  // Test mode hook for automated unit/integration security testing
  if (process.env.NODE_ENV === 'test' && token.startsWith('MOCK_TOKEN_')) {
    const mockUid = token.replace('MOCK_TOKEN_', '');
    req.user = {
      uid: mockUid,
      email: `${mockUid}@test.local`,
      isMock: true
    };
    return next();
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      authTime: decodedToken.auth_time
    };
    return next();
  } catch (error) {
    console.error(`[AuthMiddleware] Token verification failed: ${error.message}`);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired authentication token.',
      code: 'AUTH_TOKEN_INVALID'
    });
  }
}
