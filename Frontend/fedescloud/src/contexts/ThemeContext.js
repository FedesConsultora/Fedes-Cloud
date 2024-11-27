// src/contexts/ThemeContext.js
import React, { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// Crear el contexto
export const ThemeContext = createContext();

// Proveedor del contexto
const ThemeProvider = ({ children }) => {
  // Verificar si el usuario ya ha seleccionado un tema previamente
  const storedTheme = localStorage.getItem('theme');
  const [theme, setTheme] = useState(storedTheme || 'light');

  useEffect(() => {
    // Aplicar la clase al body
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${theme}-theme`);
    // Guardar la preferencia del usuario
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ThemeProvider;