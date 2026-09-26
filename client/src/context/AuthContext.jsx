import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../api/axios';

const AuthContext = createContext();
  
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    sessionStorage.clear();
    setToken(null);
    setUser(null);
  }, []);

  const fetchUserProfile = useCallback(async () => {
    const activeToken = token || localStorage.getItem('token');
    if (!activeToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Authorization': `Bearer ${activeToken}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
      } else {
        logout();
      }
    } catch (err) {
      console.error('[AuthContext] Failed to fetch user profile:', err);
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { 
          success: false, 
          error: data.error || data.message || 'Invalid email or password.' 
        };
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (err) {
      console.error('[AuthContext] Login connection error:', err);
      return { 
        success: false, 
        error: 'Unable to connect to server. If the server was sleeping, please wait 30 seconds and try again.' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(userData)
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { 
          success: false, 
          error: data.error || data.message || (data.errors && data.errors[0]?.msg) || 'Registration failed.' 
        };
      }

      return { success: true, requiresVerification: data.requiresVerification, message: data.message };
    } catch (err) {
      console.error('[AuthContext] Registration connection error:', err);
      return { 
        success: false, 
        error: 'Unable to connect to server. If the server was sleeping, please wait 30 seconds and try again.' 
      };
    }
  };

  const updateUserProfile = async (updates) => {
    const activeToken = token || localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Authorization': `Bearer ${activeToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setUser(data.user);
        return { success: true, message: data.message || 'Profile updated successfully!' };
      }
      return { success: false, message: data.message || data.error || 'Failed to update profile.' };
    } catch (err) {
      console.error('[AuthContext] Update profile error:', err);
      return { success: false, message: err.message || 'Network error updating profile.' };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
      fetchUserProfile,
      updateUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);