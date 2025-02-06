// src/pages/Home.js

import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.js';
import { FaGlobe, FaCertificate, FaCreditCard, FaUser, FaCog, FaUserShield } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const dashboardItems = [
    {
      title: 'Mis Dominios',
      icon: <FaGlobe />,
      onClick: () => navigate('/dominios'),
    },
    {
      title: 'Mis Certificados SSL',
      icon: <FaCertificate />,
      onClick: () => navigate('/certificados-ssl'), 
    },
    {
      title: 'Perfil',
      icon: <FaUser />,
      onClick: () => navigate('/user/profile'),
    },
    {
      title: 'Mis Pagos',
      icon: <FaCreditCard />,
      onClick: () => navigate('/pagos'), 
    },
    
    {
      title: 'Configuración',
      icon: <FaCog />,
      onClick: () => navigate('/settings'),
    },
  ];

  // Agregar el botón de Administrador si el usuario tiene el rol 'admin'
  if (user && user.rol && user.rol.nombre.toLowerCase() === 'admin') {
    dashboardItems.push({
      title: 'Administrador',
      icon: <FaUserShield />,
      onClick: () => navigate('/admin'),
    });
  }

  return (
    <div className="home-page">
      <div className="welcome-section">
        <h1>Bienvenido, {user.nombre || 'Usuario'}!</h1>
      </div>
      
      <div className="dashboard">
        {dashboardItems.map((item, index) => (
          <button key={index} className="dashboard-button" onClick={item.onClick} aria-label={item.title}>
            <div className="icon">{item.icon}</div>
            <span className="title">{item.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Home;
