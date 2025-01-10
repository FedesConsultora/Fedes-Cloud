// src/contexts/AuthContext.js

import React, { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import config from '../config/config.js';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [tempToken, setTempToken] = useState(null);

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
      if (loading) setLoading(false);
    }
  };

  // Llamar a fetchUserProfile sólo una vez al inicio para ver si ya hay sesión
  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    // Si hay usuario, cada 5 minutos actualizamos el perfil
    if (user) {
      const intervalId = setInterval(() => {
        fetchUserProfile();
      }, 5 * 60 * 1000);
      return () => clearInterval(intervalId);
    }
  }, [user]);

  const login = async (data = {}) => {
    // Si el login es sin 2FA o ya completo, llamamos fetchUserProfile
    if (!data.twoFactorRequired) {
      await fetchUserProfile();
      setTwoFactorRequired(false);
      setTempToken(null);
    } else {
      // Si se requiere 2FA, no llamamos aún a fetchUserProfile
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
      // Ahora sí tenemos JWT, obtener el perfil
      await fetchUserProfile();
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
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const updateUser = (updatedUserData) => setUser(updatedUserData);

  // Determinar si el usuario es administrador
  const isAdmin = user?.id_rol === 1;

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUser, twoFactorRequired, completeTwoFactorAuth, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};