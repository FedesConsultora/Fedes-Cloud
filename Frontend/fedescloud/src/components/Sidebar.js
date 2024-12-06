// src/components/Sidebar.js
import React from 'react';
import { FaHome, FaUser, FaCog } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <div className="logo-container">
        <img src={`${process.env.PUBLIC_URL}/assets/images/FedesCloudDark.webp`} alt="FedesCloud Logo" className="logo" />
      </div>
      <nav className="navigation">
        <ul>
          <li onClick={() => navigate('/')}>
            <FaHome />
            <span>Inicio</span>
          </li>
          <li onClick={() => navigate('/profile')}>
            <FaUser />
            <span>Perfil</span>
          </li>
          <li onClick={() => navigate('/settings')}>
            <FaCog />
            <span>Configuración</span>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;