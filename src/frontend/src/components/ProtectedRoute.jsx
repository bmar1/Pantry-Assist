import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ message: 'You must log in to access this page.' }} />;
  }

  return children;
};

export default ProtectedRoute;
