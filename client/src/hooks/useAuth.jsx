import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuth, setIsAuth] = useState(() => !!localStorage.getItem('userRole'));
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole') || '');

  const login = (role) => {
    localStorage.setItem('userRole', role);
    setIsAuth(true);
    setUserRole(role);
  };

  const logout = () => {
    localStorage.removeItem('userRole');
    setIsAuth(false);
    setUserRole('');
  };

  return (
    <AuthContext.Provider value={{ isAuth, userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth harus di dalam AuthProvider');
  return context;
};