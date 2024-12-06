// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import config from '../config/config.js'; 

// Crear el contexto
export const AuthContext = createContext();

// Proveedor del contexto
export function AuthProvider({ children }) {
  // Estado de autenticación
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 

  // Función para obtener el perfil del usuario
  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${config.API_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Importante para enviar cookies
      });
      console.log('Response: ', response);
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.data); // Asumiendo que la respuesta tiene una propiedad 'data'
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
      setUser(null);
    } finally {
      console.log('entre a finally')
      if (loading) {
        setLoading(false); 
      }
    }
  };

  // Función para iniciar sesión
  const login = async () => {
    // Después de un inicio de sesión exitoso, obtenemos el perfil del usuario
    await fetchUserProfile();
  };

  const logout = async () => {
    try {
      const response = await fetch(`${config.API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      console.log('Response: ', response);
      if (response.ok) {
        setUser(null);
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Función para actualizar el usuario (si es necesario)
  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
  };

  useEffect(() => {
    // Al iniciar la aplicación, verificar si el usuario está autenticado
    fetchUserProfile();

    // Verificar periódicamente si el usuario está autenticado
    const intervalId = setInterval(() => {
      fetchUserProfile();
    }, 5 * 60 * 1000); // Cada 5 minutos

    // Limpiar el intervalo al desmontar el componente
    return () => clearInterval(intervalId);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};