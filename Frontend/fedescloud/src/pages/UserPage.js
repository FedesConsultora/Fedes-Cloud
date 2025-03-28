// src/pages/UserPage.js
import React, { useContext } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { FaUser, FaRegAddressBook, FaRegCreditCard, FaUsers } from 'react-icons/fa';
import { AuthContext } from '../contexts/AuthContext.js';

const UserPage = () => {
  // Obtenemos el flag para saber si se está accediendo como cuenta padre.
  const { accessAsParent } = useContext(AuthContext);

  return (
    <div className="user-page">
      <h2>Mi Usuario</h2>
      <div className="user-tabs">
        <NavLink
          to="/user/profile"
          className={({ isActive }) => (isActive ? "tab active" : "tab")}
        >
          <FaUser className="icon" />
          <span>Perfil</span>
        </NavLink>
        <NavLink
          to="/user/contact"
          className={({ isActive }) => (isActive ? "tab active" : "tab")}
        >
          <FaRegAddressBook className="icon" />
          <span>Datos de contacto</span>
        </NavLink>
        <NavLink
          to="/user/billing"
          className={({ isActive }) => (isActive ? "tab active" : "tab")}
        >
          <FaRegCreditCard className="icon" />
          <span>Datos de facturación</span>
        </NavLink>
        {/* Solo se muestra la pestaña de "Gestión de Usuarios" si NO estamos en modo cuenta padre */}
        {!accessAsParent && (
          <NavLink
            to="/user/management"
            className={({ isActive }) => (isActive ? "tab active" : "tab")}
          >
            <FaUsers className="icon" />
            <span>Gestión de Usuarios</span>
          </NavLink>
        )}
      </div>
      <div className="user-content">
        <Outlet />
      </div>
    </div>
  );
};

export default UserPage;
