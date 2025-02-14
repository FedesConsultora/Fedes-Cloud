// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import config from '../config/config.js';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [tempToken, setTempToken] = useState(null);
  const [accessAsParent, setAccessAsParent] = useState(false);
  const [subRole, setSubRole] = useState(null);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${config.API_URL}/auth/profile`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Actualiza el flag leyendo el token actual desde localStorage,
  // pero solo si el token tiene formato JWT (tres partes separadas por puntos)
  const updateAccessFromToken = () => {
    const token = localStorage.getItem('token');
    if (token && token.split('.').length === 3) {
      try {
        const decoded = jwtDecode(token);
        setAccessAsParent(!!decoded.accessAsParent);
        setSubRole(decoded.subRole || null);
      } catch (err) {
        console.error('Error decodificando token:', err);
        setAccessAsParent(false);
        setSubRole(null);
      }
    } else {
      setAccessAsParent(false);
      setSubRole(null);
    }
  };

  useEffect(() => {
    // Si la ruta es de confirmación, no actualizamos el perfil para que el usuario no quede logueado
    if (window.location.pathname.startsWith('/auth/confirm-email')) {
      setUser(null);
      setLoading(false);
      return;
    }
    fetchUserProfile();
    updateAccessFromToken();
  }, []);

  useEffect(() => {
    if (user) {
      const intervalId = setInterval(() => {
        fetchUserProfile();
        updateAccessFromToken();
      }, 5 * 60 * 1000);
      return () => clearInterval(intervalId);
    }
  }, [user]);

  const login = async (data = {}) => {
    if (!data.twoFactorRequired) {
      await fetchUserProfile();
      // Si no se ha guardado aún el token original del hijo, guárdalo
      if (!localStorage.getItem('childToken') && localStorage.getItem('token')) {
        localStorage.setItem('childToken', localStorage.getItem('token'));
      }
      localStorage.removeItem('accessAsParent');
      updateAccessFromToken();
      setTwoFactorRequired(false);
      setTempToken(null);
    } else {
      setTwoFactorRequired(true);
      setTempToken(data.tempToken);
    }
  };

  const completeTwoFactorAuth = async (twoFactorToken) => {
    const response = await fetch(`${config.API_URL}/auth/login-2fa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tempToken, twoFactorToken }),
      credentials: 'include',
    });
    const result = await response.json();
    if (response.ok) {
      await fetchUserProfile();
      updateAccessFromToken();
      setTwoFactorRequired(false);
      setTempToken(null);
    } else {
      throw new Error(result.message || 'Error en la verificación de 2FA');
    }
  };

  const logout = async () => {
    try {
      const response = await fetch(`${config.API_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (response.ok) {
        setUser(null);
        setTwoFactorRequired(false);
        setTempToken(null);
        setAccessAsParent(false);
        setSubRole(null);
        localStorage.removeItem('token');
        localStorage.removeItem('childToken');
        localStorage.removeItem('accessAsParent');
        localStorage.removeItem('childProfile');
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const updateUser = (updatedUserData) => setUser(updatedUserData);

  const isAdmin = user?.id_rol === 1;

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        updateUser,
        twoFactorRequired,
        completeTwoFactorAuth,
        isAdmin,
        accessAsParent,
        subRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthProvider;
