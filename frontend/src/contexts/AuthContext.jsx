import React, { createContext, useState, useEffect } from 'react';
import authApi from '../services/authApi';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedToken = authApi.getToken();
    const storedUser = authApi.getUser();

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authApi.login(email, password);
      setUser(response.user);
      setToken(response.token);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.error || 'Login failed' };
    }
  };

  const signup = async (email, password, confirmPassword, firstName, lastName) => {
    try {
      const response = await authApi.signup(email, password, confirmPassword, firstName, lastName);
      setUser(response.user);
      setToken(response.token);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.error || 'Signup failed' };
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  };

  const deleteAccount = async () => {
    try {
      await authApi.deleteAccount(token);
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.error || 'Failed to delete account' };
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    signup,
    logout,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
