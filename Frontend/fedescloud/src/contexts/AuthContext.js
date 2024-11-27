// src/contexts/AuthContext.js

import React, { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// Crear el contexto
export const AuthContext = createContext();

// Proveedor del contexto
export function AuthProvider({ children }) {
  // Estado de autenticación
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null); // Estado del token
  const [loading, setLoading] = useState(true); // Estado de carga

  // Función para iniciar sesión
  const login = async (authToken) => {
    // Guardar el token en localStorage y en el estado
    localStorage.setItem('authToken', authToken);
    setToken(authToken);

    try {
      // Realizar una solicitud al backend para obtener el perfil del usuario
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`, // Enviar el token en la cabecera
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // Si la respuesta no es ok, manejar el error
        console.error('Error al obtener el perfil del usuario:', response.statusText);
        localStorage.removeItem('authToken');
        setUser(null);
        setToken(null);
      }
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
      localStorage.removeItem('authToken');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false); // Finalizar la carga
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    // Eliminar el token del localStorage y reiniciar el estado
    localStorage.removeItem('authToken');
    setUser(null);
    setToken(null);
  };

  // Función para actualizar el usuario
  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
  };

  useEffect(() => {
    // Obtener el token del localStorage
    const storedToken = localStorage.getItem('authToken');

    if (storedToken) {
      setToken(storedToken); // Guardar el token en el estado
      // Intentar obtener el perfil del usuario
      const fetchUserProfile = async () => {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/profile`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${storedToken}`, // Enviar el token en la cabecera
            },
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            // Si la respuesta no es ok, manejar el error
            console.error('Error al obtener el perfil del usuario:', response.statusText);
            localStorage.removeItem('authToken');
            setUser(null);
            setToken(null);
          }
        } catch (error) {
          console.error('Error al conectar con el servidor:', error);
          localStorage.removeItem('authToken');
          setUser(null);
          setToken(null);
        } finally {
          setLoading(false); // Finalizar la carga
        }
      };

      fetchUserProfile();
    } else {
      // No hay token, el usuario no está autenticado
      setUser(null);
      setToken(null);
      setLoading(false); // Finalizar la carga
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
