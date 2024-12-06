// src/pages/Settings.js
import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.js';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  return (
    <div className="settings">
      <h2>Configuración</h2>
      <button onClick={handleLogout}>Cerrar Sesión</button>
    </div>
  );
};

export default Settings;
