import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import {
  auth,
  isFirebaseConfigured,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from '../lib/firebase';
import { getAccessToken, getRefreshToken, getStoredUser, setSession, clearSession } from '../services/authStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState(isFirebaseConfigured ? 'firebase' : 'local');

  const applySession = useCallback((session) => {
    setSession({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      user: session.user,
    });
    setUser(session.user);
  }, []);

  const restoreSession = useCallback(async () => {
    const access = getAccessToken();
    const refresh = getRefreshToken();

    if (!access && !refresh) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get('/auth/me');
      setUser(data.data);
      setSession({ accessToken: access, refreshToken: refresh, user: data.data });
    } catch {
      if (refresh) {
        try {
          const { data } = await api.post('/auth/refresh', { refreshToken: refresh });
          applySession(data.data);
        } catch {
          clearSession();
          setUser(null);
        }
      } else {
        clearSession();
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, [applySession]);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return undefined;

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) return;
      const existing = getAccessToken();
      if (existing) return;

      try {
        const idToken = await firebaseUser.getIdToken();
        const { data } = await api.post('/auth/firebase', { idToken });
        applySession(data.data);
      } catch {
        // Firebase user without portal account — handled at login
      }
    });

    return () => unsub();
  }, [applySession]);

  const login = async (email, password) => {
    if (isFirebaseConfigured && auth) {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await credential.user.getIdToken();
      const { data } = await api.post('/auth/firebase', { idToken });
      applySession(data.data);
      setAuthMode('firebase');
      return data.data.user;
    }

    const { data } = await api.post('/auth/login', { email, password });
    applySession(data.data);
    setAuthMode('local');
    return data.data.user;
  };

  const logout = async () => {
    const refreshToken = getRefreshToken();
    try {
      await api.post('/auth/logout', { refreshToken });
    } catch {
      // ignore
    }
    if (isFirebaseConfigured && auth) {
      try {
        await firebaseSignOut(auth);
      } catch {
        // ignore
      }
    }
    clearSession();
    setUser(null);
  };

  const refreshProfile = async () => {
    const { data } = await api.get('/auth/me');
    setUser(data.data);
    setSession({ accessToken: getAccessToken(), refreshToken: getRefreshToken(), user: data.data });
    return data.data;
  };

  const hasRole = (...roles) => user && roles.includes(user.role);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authMode,
        isFirebaseConfigured,
        login,
        logout,
        refreshProfile,
        hasRole,
        isAuthenticated: Boolean(user && getAccessToken()),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
