import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';
import { clearAuth, getStoredUser, saveUser } from '../utils/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const stored = getStoredUser();
  const [user, setUser] = useState(stored?.name ? stored : null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    authApi
      .getProfile()
      .then(({ data }) => {
        setUser(data.data);
        saveUser(data.data);
      })
      .catch(() => {
        clearAuth();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (credentials) => {
    const { data } = await authApi.login(credentials);
    const userData = data.data;
    localStorage.setItem('token', userData.token);
    const { token: _, ...userWithoutToken } = userData;
    saveUser(userWithoutToken);
    setUser(userWithoutToken);
    return userWithoutToken;
  }, []);

  const register = useCallback(async (credentials) => {
    const { data } = await authApi.register(credentials);
    const userData = data.data;
    localStorage.setItem('token', userData.token);
    const { token: _, ...userWithoutToken } = userData;
    saveUser(userWithoutToken);
    setUser(userWithoutToken);
    return userWithoutToken;
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
  }, []);

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
