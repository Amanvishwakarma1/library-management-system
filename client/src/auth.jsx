import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('auth');
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (user?.token) {
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + user.token;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [user]);

  const login = (data) => {
    setUser(data);
    localStorage.setItem('auth', JSON.stringify(data));
  };
  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth');
    window.location.href = '/';
  };

  return <AuthCtx.Provider value={{ user: user?.user || user, role: user?.role || user?.user?.role, token: user?.token, login, logout }}>{children}</AuthCtx.Provider>;
}

export function useAuth() { return useContext(AuthCtx); }
