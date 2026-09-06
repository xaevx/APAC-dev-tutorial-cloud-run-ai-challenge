import admin from 'firebase-admin';

// In-memory isolated store for testing / local fallback mode
const inMemoryUserStore = new Map(); // uid -> Map(sessionId -> sessionObj)

function getInMemoryUserMap(uid) {
  if (!inMemoryUserStore.has(uid)) {
    inMemoryUserStore.clear ? null : null;
    inMemoryUserStore.set(uid, new Map());
  }
  return inMemoryUserStore.get(uid);
}

/**
 * Save or update a journal session strictly scoped under users/{uid}/sessions/{sessionId}
 */
export async function saveUserSession(uid, sessionData) {
  if (!uid) throw new Error('UID is required for Firestore operations.');

  const sessionId = sessionData.id || `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date().toISOString();

  const sessionDoc = {
    id: sessionId,
    uid: uid, // explicitly stored for validation
    title: sessionData.title || 'Untitled Journal Session',
    created_at: sessionData.created_at || now,
    updated_at: now,
    messages: sessionData.messages || [],
    summary: sessionData.summary || null,
    tags: sessionData.tags || [],
    status: sessionData.status || 'completed'
  };

  try {
    const db = admin.firestore();
    const docRef = db.collection('users').doc(uid).collection('sessions').doc(sessionId);
    await docRef.set(sessionDoc, { merge: true });
    console.log(`[Firestore] Session ${sessionId} saved for user ${uid}`);
    return sessionDoc;
  } catch (error) {
    console.warn(`[Firestore] Admin SDK unavailable or failed (${error.message}). Using secure in-memory store for UID ${uid}`);
    const userMap = getInMemoryUserMap(uid);
    userMap.set(sessionId, sessionDoc);
    return sessionDoc;
  }
}

/**
 * Retrieve all journal sessions for a specific user UID
 */
export async function getUserSessions(uid) {
  if (!uid) throw new Error('UID is required for Firestore operations.');

  try {
    const db = admin.firestore();
    const snapshot = await db.collection('users').doc(uid).collection('sessions')
      .orderBy('created_at', 'desc')
      .get();
    
    return snapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.warn(`[Firestore] Admin SDK unavailable or failed (${error.message}). Fetching from secure in-memory store for UID ${uid}`);
    const userMap = getInMemoryUserMap(uid);
    const sessions = Array.from(userMap.values());
    return sessions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
}

/**
 * Retrieve a specific session for a user by sessionId
 * Throws or returns null if session does not belong to the user
 */
export async function getUserSessionById(uid, sessionId) {
  if (!uid) throw new Error('UID is required.');
  if (!sessionId) throw new Error('Session ID is required.');

  try {
    const db = admin.firestore();
    const doc = await db.collection('users').doc(uid).collection('sessions').doc(sessionId).get();
    if (!doc.exists) return null;
    const data = doc.data();
    // Extra security verification: verify UID inside doc matches authenticated UID
    if (data.uid && data.uid !== uid) {
      console.error(`[Security Alert] Document UID mismatch! Doc UID: ${data.uid}, Auth UID: ${uid}`);
      return null;
    }
    return data;
  } catch (error) {
    console.warn(`[Firestore] Admin SDK lookup fallback for UID ${uid}`);
    const userMap = getInMemoryUserMap(uid);
    return userMap.get(sessionId) || null;
  }
}

/**
 * Delete a specific journal session strictly scoped to user UID
 */
export async function deleteUserSession(uid, sessionId) {
  if (!uid || !sessionId) throw new Error('UID and Session ID are required.');

  try {
    const db = admin.firestore();
    const docRef = db.collection('users').doc(uid).collection('sessions').doc(sessionId);
    const doc = await docRef.get();
    if (!doc.exists) return false;
    
    await docRef.delete();
    console.log(`[Firestore] Deleted session ${sessionId} for user ${uid}`);
    return true;
  } catch (error) {
    console.warn(`[Firestore] Admin SDK delete fallback for UID ${uid}`);
    const userMap = getInMemoryUserMap(uid);
    if (userMap.has(sessionId)) {
      userMap.delete(sessionId);
      return true;
    }
    return false;
  }
}
