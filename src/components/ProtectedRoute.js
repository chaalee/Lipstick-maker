// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  
  // Simple password check - you might want to implement a more secure solution
  const isAuthenticated = () => {
    const password = localStorage.getItem('statsPassword');
    return password === 'your-secure-password'; // Change this to your desired password
  };

  if (!isAuthenticated()) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
