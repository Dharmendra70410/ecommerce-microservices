import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

function decodeJwtPayload(jwtToken) {
  try {
    const payload = jwtToken?.split('.')?.[1];
    if (!payload) {
      return null;
    }

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(normalized);
    return JSON.parse(decoded);
  } catch (_error) {
    return null;
  }
}

function buildUserFromToken(jwtToken) {
  const payload = decodeJwtPayload(jwtToken);
  if (!payload) {
    return null;
  }

  return {
    id: payload.userId || payload.sub || null,
    email: payload.email || null,
    username: payload.username || payload.email?.split('@')?.[0] || 'User',
    role: payload.role || 'user'
  };
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('accessToken') || localStorage.getItem('token');

    if (storedToken && (storedAuth === 'true' || storedAuth === null)) {
      try {
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;
        const effectiveUser = parsedUser && typeof parsedUser === 'object'
          ? parsedUser
          : buildUserFromToken(storedToken);

        if (!effectiveUser) {
          throw new Error('Unable to restore user from storage');
        }

        setIsAuthenticated(true);
        setUser(effectiveUser);
        setToken(storedToken);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify(effectiveUser));
      } catch (_error) {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, authToken) => {
    const effectiveUser = (userData && typeof userData === 'object')
      ? userData
      : buildUserFromToken(authToken);

    setIsAuthenticated(true);
    setUser(effectiveUser || null);
    setToken(authToken || null);
    localStorage.setItem('isAuthenticated', 'true');
    if (effectiveUser) {
      localStorage.setItem('user', JSON.stringify(effectiveUser));
    } else {
      localStorage.removeItem('user');
    }
    if (authToken) {
      localStorage.setItem('accessToken', authToken);
      localStorage.setItem('token', authToken);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('token');
  };

  const signup = (userData, authToken) => {
    // Signup also logs the user in
    login(userData, authToken);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      token,
      loading,
      login,
      logout,
      signup
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
