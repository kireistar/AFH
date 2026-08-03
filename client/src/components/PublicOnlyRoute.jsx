import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const PublicOnlyRoute = () => {
  const { isAuth, userRole } = useAuth();

  if (isAuth) {
    return <Navigate to={`/${userRole}`} replace />;
  }

  return <Outlet />;
};

export default PublicOnlyRoute;
