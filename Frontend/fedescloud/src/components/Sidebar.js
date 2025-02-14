// src/components/Sidebar.js
import React, { useContext, useState } from 'react';
import { 
  FaHome, 
  FaCog, 
  FaGlobe, 
  FaUserShield, 
  FaChevronDown, 
  FaChevronUp, 
  FaRegClipboard, 
  FaCertificate, 
  FaCreditCard,
  
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext.js';
import UserInfo from './UserInfo.js';

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout, isAdmin } = useContext(AuthContext);
  const [isServiciosOpen, setIsServiciosOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const toggleServicios = () => {
    setIsServiciosOpen(!isServiciosOpen);
  };

  return (
    <aside className="sidebar">
      <div className="logo-container">
        <img 
          src={`${process.env.PUBLIC_URL}/assets/images/FedesCloudLight.webp`} 
          alt="FedesCloud Logo" 
          className="logo" 
        />
      </div>
      
      
      
      <nav className="navigation">
        <ul>
          <li onClick={() => navigate('/')} className="nav-item">
            <FaHome className="icon" />
            <span className="label">Inicio</span>
          </li>

          {/* Menú Desplegable "Servicios" */}
          <li className={`nav-item servicios ${isServiciosOpen ? 'open' : ''}`}>
            <div className="servicios-header" onClick={toggleServicios}>
              <FaRegClipboard className="icon" />
              <span className="label">Servicios</span>
              <span className="chevron-icon">
                {isServiciosOpen ? <FaChevronUp /> : <FaChevronDown />}
              </span>
            </div>
            {/* Submenú de Servicios */}
            {isServiciosOpen && (
              <ul className="submenu">
                <li onClick={() => navigate('/dominios')} className="submenu-item">
                  <FaGlobe className="icon" />
                  <span className="label">Mis Dominios</span>
                </li>
                <li onClick={() => navigate('/certificados-ssl')} className="submenu-item">
                  <FaCertificate className="icon" />
                  <span className="label">Certificados SSL</span>
                </li>
              </ul>
            )}
          </li>

          {/* Enlace para Administrador, solo visible para admins */}
          {isAdmin && (
            <li onClick={() => navigate('/admin')} className="nav-item">
              <FaUserShield className="icon" />
              <span className="label">Administrador</span>
            </li>
          )}
          <li onClick={() => navigate('/pagos')} className="nav-item">
            <FaCreditCard className="icon" />
            <span className="label">Mis Pagos</span>
          </li>
          <li onClick={() => navigate('/settings')} className="nav-item">
            <FaCog className="icon" />
            <span className="label">Configuración</span>
          </li>
        </ul>
      </nav>
      
      <UserInfo onLogout={handleLogout} />
    </aside>
  );
};

export default Sidebar;
