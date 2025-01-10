// src/components/Sidebar.js

import React, { useContext } from 'react';
import { FaHome, FaCog, FaGlobe, FaUserShield } from 'react-icons/fa'; // Importar FaUserShield para Admin
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext.js';
import UserInfo from './UserInfo.js';

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout, isAdmin } = useContext(AuthContext); // Obtener isAdmin del contexto

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside className="sidebar">
      <div className="logo-container">
        <img src={`${process.env.PUBLIC_URL}/assets/images/FedesCloudLight.webp`} alt="FedesCloud Logo" className="logo" />
      </div>
      <nav className="navigation">
        <ul>
          <li onClick={() => navigate('/')}>
            <FaHome />
            <span>Inicio</span>
          </li>
          <li onClick={() => navigate('/settings')}>
            <FaCog />
            <span>Configuración</span>
          </li>
          <li onClick={() => navigate('/dominios')}>
            <FaGlobe />
            <span>Dominios</span>
          </li>
          {/* Enlace para Administrador, solo visible para admins */}
          {isAdmin && (
            <li onClick={() => navigate('/admin')}>
              <FaUserShield />
              <span>Administrador</span>
            </li>
          )}
        </ul>
      </nav>
      {/* Componente UserInfo al final del sidebar */}
      <UserInfo onLogout={handleLogout} />
    </aside>
  );
};

export default Sidebar;
 