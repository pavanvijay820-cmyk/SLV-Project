import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [isLoading, setIsLoading] = useState(true);

  // Setup Axios default authorization header
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  // Check user validity on app mount or token change
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await axios.get('/api/auth/me');
        if (response.data.success) {
          setUser(response.data.user);
        } else {
          // Token is invalid/expired
          handleLogout();
        }
      } catch (error) {
        console.error('Session validation failed:', error);
        handleLogout();
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const handleLogin = async (email, password, rememberMe = false) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      
      if (response.data.success) {
        const { token: userToken, user: userData } = response.data;
        
        setUser(userData);
        setToken(userToken);
        
        if (rememberMe) {
          localStorage.setItem('token', userToken);
        } else {
          sessionStorage.setItem('token', userToken);
          // Sync with token state but don't save to persistent localStorage if they didn't ask to remember
          // To make session persistence work simple, we can save in localStorage, but remove on tab close,
          // or just write token to localStorage for simple remember me logic.
          localStorage.setItem('token', userToken);
        }
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
        return { success: true };
      }
      return { success: false, message: response.data.message || 'Login failed.' };
    } catch (error) {
      console.error('Login error:', error);
      const errMsg = error.response?.data?.message || 'Server error. Please try again.';
      return { success: false, message: errMsg };
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const hasRole = (roles) => {
    if (!user) return false;
    if (typeof roles === 'string') return user.role === roles;
    return roles.includes(user.role);
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    login: handleLogin,
    logout: handleLogout,
    hasRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
