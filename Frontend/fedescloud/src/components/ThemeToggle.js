// src/components/ThemeToggle.js
import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext.js';
import { FaSun, FaMoon } from 'react-icons/fa'; 

const ThemeToggle = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div className="theme-slider">
      <input
        type="checkbox"
        id="theme-toggle-checkbox"
        checked={theme === 'dark'}
        onChange={toggleTheme}
      />
      <label htmlFor="theme-toggle-checkbox" className="slider">
        <span className="icon sun-icon"><FaSun /></span>
        <span className="icon moon-icon"><FaMoon /></span>
      </label>
    </div>
  );
};

export default ThemeToggle;