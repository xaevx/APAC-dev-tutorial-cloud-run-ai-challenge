import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { auth, googleProvider } from './config';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [idToken, setIdToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Monitor Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          setCurrentUser(user);
          setIdToken(token);
        } catch (err) {
          console.error('[AuthContext] Failed to retrieve ID token:', err);
          setCurrentUser(user);
          setIdToken(`MOCK_TOKEN_${user.uid}`);
        }
      } else {
        // Unauthenticated state
        setCurrentUser(null);
        setIdToken(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Demo Sign In Helper (for evaluation & testing without live Firebase backend setup)
  const signInDemoUser = async (roleName = 'demo_user_alpha') => {
    setLoading(true);
    const mockUser = {
      uid: `uid_${roleName}`,
      email: `${roleName}@mindloom.ai`,
      displayName: roleName === 'demo_user_alpha' ? 'Alex Rivera (User A)' : 'Taylor Chen (User B)',
      photoURL: null,
      isDemo: true
    };
    setCurrentUser(mockUser);
    setIdToken(`MOCK_TOKEN_${mockUser.uid}`);
    setLoading(false);
  };

  const loginWithEmail = async (email, password) => {
    setAuthError(null);
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const registerWithEmail = async (email, password) => {
    setAuthError(null);
    try {
      return await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    setAuthError(null);
    try {
      return await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (currentUser && !currentUser.isDemo) {
        await firebaseSignOut(auth);
      }
    } catch (err) {
      console.warn('[AuthContext] Firebase signout fallback:', err);
    } finally {
      setCurrentUser(null);
      setIdToken(null);
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    idToken,
    loading,
    authError,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    signInDemoUser,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
