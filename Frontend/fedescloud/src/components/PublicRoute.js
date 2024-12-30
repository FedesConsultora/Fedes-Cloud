// src/components/PublicRoute.js
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext.js';
import { useLocation } from 'react-router-dom';

const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (location.pathname === '/api-docs') {
    return children; // Permite acceso directo a /api-docs
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  // Si no está logueado, permite acceder a la ruta pública
  return children;
};

export default PublicRoute;
