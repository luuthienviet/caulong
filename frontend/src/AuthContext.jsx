import React, { createContext, useEffect, useState } from 'react';

export const AuthContext = createContext(null);

const loadStoredUser = () => {
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    try {
      return JSON.parse(currentUser);
    } catch (err) {
      console.error('AuthContext load currentUser error:', err);
    }
  }

  const ktbUser = localStorage.getItem('ktb_user');
  if (ktbUser) {
    try {
      const parsed = JSON.parse(ktbUser);
      return { ...parsed, role: parsed.role || 'user' };
    } catch (err) {
      console.error('AuthContext load ktb_user error:', err);
    }
  }

  return null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(loadStoredUser);

  const login = (userData) => {
    if (!userData) return;
    localStorage.setItem('currentUser', JSON.stringify(userData));
    const ktbData = {
      name: userData.name || userData.username,
      phone: userData.phone || '',
      loginTime: new Date().toISOString(),
      role: userData.role || 'user'
    };
    localStorage.setItem('ktb_user', JSON.stringify(ktbData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('avatar');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    localStorage.removeItem('ktb_user');
    localStorage.removeItem('notifications');
    setUser(null);
  };

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'admin') {
      const current = localStorage.getItem('ktb_user');
      const loginTime = current ? (() => {
        try {
          return JSON.parse(current).loginTime || new Date().toISOString();
        } catch {
          return new Date().toISOString();
        }
      })() : new Date().toISOString();
      const ktbData = {
        name: user.name || user.username,
        phone: user.phone || '',
        loginTime,
        role: user.role || 'user'
      };
      localStorage.setItem('ktb_user', JSON.stringify(ktbData));
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
