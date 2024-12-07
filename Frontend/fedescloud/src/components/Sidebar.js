// src/components/Sidebar.js
import React, { useContext } from 'react';
import { FaHome, FaCog } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext.js';
import UserInfo from './UserInfo.js';

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

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
        </ul>
      </nav>
      {/* Aquí colocamos el componente UserInfo al final del sidebar */}
      <UserInfo onLogout={handleLogout} />
    </aside>
  );
};

export default Sidebar;
